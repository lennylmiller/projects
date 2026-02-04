# Jira Ticket: Magic Link API Migration

## Title

**Migrate magic-link-service redeem endpoints to new API format with client-side JWT decoding**

---

## Description

### Summary

Migrate the magic link token redemption flow from the deprecated endpoint format to the new endpoint format that requires `userId` in the URL path. This change requires decoding the JWT token client-side to extract the `userId` before making the API call.

### Background

The backend team is deprecating the current redeem endpoints in favor of new endpoints that require `userId` as a path parameter. The token (which is a JWT) will be moved to a query parameter.

### API Changes

| | Deprecated | New |
|---|---|---|
| **Endpoint** | `PUT /v1/institutions/{id}/token/{token}/redeem` | `PUT /v1/institutions/{id}/users/{userId}/redeem?token={token}` |
| **userId source** | Returned in API response | Decoded from JWT client-side |
| **Token location** | URL path | Query parameter |

### Scope

- [ ] Create new utility function to decode JWT tokens and extract `userId`
- [ ] Update `MagicLinkController.redeemMagicLinkToken()` to use new endpoint
- [ ] Update `UserManagementController.redeemMagicLinkToken()` to use new endpoint
- [ ] Update mock data to match new endpoint format
- [ ] Update/enable unit tests with new expectations
- [ ] Add error handling for invalid JWT token format

### Acceptance Criteria

- Token redemption works with the new endpoint format
- Invalid/malformed JWT tokens are handled gracefully with appropriate error messaging
- Existing flows (org user invite, 2FA setup) continue to work
- Unit tests pass

### Technical Notes

- JWT decode pattern already exists in `src/js/util/new-device-jwt.js` and can be reused
- Response structure remains the same; ensure `userId` is still available to consuming components
- New utility file: `src/js/util/magic-link-token.js`

---

## Risk Assessment

### Overall Risk: MEDIUM-HIGH

This is a small code change that touches multiple critical user paths.

### Use Case Impact Analysis

```
UC1 (Invite Org User) ──includes──► UC2 (Redeem Token) ──extends──► UC3 (Setup 2FA)
                                          │
                                          ▼
                                    THIS CHANGES
```

| Use Case | Affected? | Reason |
|----------|-----------|--------|
| **Invite Organization User** | YES | Includes token redemption |
| **Redeem Magic Link Token** | **YES - PRIMARY** | Direct change to this flow |
| **Setup First Admin 2FA** | YES | Extends token redemption |
| **Recover Account** | No | Uses different endpoints (`/recovery/...`) |
| **Reset Password** | No | Uses different endpoints |

### Affected User Journeys

| Flow | Description | Risk Level |
|------|-------------|------------|
| **Org User Invitation** | New user invitation → token redemption → credential setup | **HIGH** - Primary onboarding path |
| **First Admin 2FA Setup** | First admin invitation → token redemption → 2FA → credentials | **HIGH** - First admin can't be created if broken |
| **Combined Flow** | Admin invites first admin → full 2FA flow | **HIGH** - Critical path for new org setup |

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT decode fails on valid tokens | Low | High | Test with real tokens from all environments |
| Backend JWT payload structure differs from expected | Medium | High | Confirm claim name (`userId` vs `sub`) with backend team before development |
| Change breaks new user onboarding | Low | Critical | Comprehensive E2E testing of full invite flow |
| Change breaks first admin 2FA setup | Low | Critical | Test first admin flow specifically |
| Two controllers get out of sync | Low | Medium | Both use shared utility function |
| Malformed tokens cause unhandled errors | Medium | Medium | Add explicit error handling for decode failures |

### Why Risk is Elevated

1. **Multiple Controllers**: Change affects 2 controllers (`MagicLinkController`, `UserManagementController`) that must stay in sync
2. **Critical User Journey**: Blocks new user onboarding if broken - users cannot complete enrollment
3. **No Partial Rollout**: All paths change simultaneously - no feature flag protection
4. **Client-Side Validation Added**: New failure mode (invalid JWT) that didn't exist before
5. **Dependency on Token Format**: If backend changes JWT structure, client decode fails silently

---

## Testing Requirements

Due to the number of paths affected, testing should cover:

### Unit Tests

- [ ] Token decode utility handles valid JWT tokens
- [ ] Token decode utility throws appropriate errors for invalid tokens
- [ ] Token decode utility handles missing `userId` claim
- [ ] Both controllers call new endpoint with correct URL format
- [ ] Both controllers include `userId` in response

### Integration/E2E Tests

- [ ] **Flow 1**: Standard org user invitation (happy path)
- [ ] **Flow 2**: First admin with 2FA required
- [ ] **Error paths**: Expired token, invalid JWT format, malformed token
- [ ] **Both controllers**: Verify `MagicLinkController` and `UserManagementController` both work

### Manual Testing Checklist

- [ ] Test with real magic link tokens from dev environment
- [ ] Test with real magic link tokens from staging environment
- [ ] Verify error messages display correctly for invalid tokens
- [ ] Verify 2FA redirect flow still works for first admin
- [ ] Verify credential setup completes successfully after token redemption

---

## Rollback Plan

If issues are discovered post-deployment:

1. **Immediate**: Revert controller changes to use legacy endpoint
2. **Backend Dependency**: Backend must maintain legacy endpoint until fix is deployed
3. **Communication**: Notify backend team if rollback is needed so they don't deprecate legacy endpoint

---

## Dependencies

- **Backend Team**: Confirm JWT payload structure (claim name for userId)
- **Backend Team**: Ensure new endpoint is deployed and stable before frontend migration
- **Backend Team**: Maintain legacy endpoint during transition period

---

## Documentation

- UML diagrams documenting old vs new flows: `magic-link-sequence-diagrams.md`
- Implementation plan: `MAGIC_LINK_CONTROLLER.md`

---

## Files Changed

| File | Change |
|------|--------|
| `src/js/util/magic-link-token.js` | NEW - JWT decode utility |
| `src/js/api/controllers/magic-link-controller.js` | Update `redeemMagicLinkToken()` |
| `src/js/api/controllers/user-management-controller.js` | Update `redeemMagicLinkToken()` |
| `mock-data/magic-link-mock-data.js` | Update endpoint regex |
| `mock-data/user-management-mock-data.js` | Update endpoint regex |
| `test/unit/magic-link-controller-spec.js` | Enable and update tests |
