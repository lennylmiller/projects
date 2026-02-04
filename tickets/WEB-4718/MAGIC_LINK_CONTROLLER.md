# Magic Link Redeem API Endpoint Migration Plan

## Overview

This plan outlines the migration from the current magic-link-service redeem endpoints to new endpoints that require `userId` in the URL path. The new endpoints are documented in [PR #1973](https://github.com/Banno/consumer-api-docs/pull/1973).

## API Changes Summary

### Current Endpoints (Deprecated)
- `PUT /v0/institutions/{institutionId}/token/{token}/redeem`
- `PUT /v1/institutions/{institutionId}/token/{token}/redeem`

### New Endpoints
- `PUT /v0/institutions/{institutionId}/users/{userId}/redeem?token={token}`
- `PUT /v1/institutions/{institutionId}/users/{userId}/redeem?token={token}`

### Key Differences
1. **userId required in path**: Must extract from token before API call
2. **Token as query parameter**: Moved from path to query string
3. **Same request body**: deviceInfo still required (already implemented via `getUaData()`)
4. **Same response structure**: Still returns `userId`, `organizationId`, `organizationName`, `redirectUri`

## Critical Implementation Strategy

### How to Obtain userId

**Research Finding**: The magic link token is a JWT (JSON Web Token). We decode it client-side to extract the userId before making the API call.

**Evidence:**
- Project already uses `jose-browser-runtime` library (package.json:155)
- Existing JWT decode pattern in `src/js/util/new-device-jwt.js`
- Token structure follows JWT format: `header.payload.signature`
- userId is in the JWT payload (likely as `userId` or `sub` claim)

## Implementation Steps

### Phase 1: Create JWT Decode Utility

**File**: `src/js/util/magic-link-token.js` (new file)

**Purpose**: Decode magic link JWT tokens to extract userId

**Implementation**:
```javascript
/**
 * Decode magic link JWT token to extract userId
 * @param {!string} token - JWT token from magic link
 * @return {{userId: string, institutionId: string}}
 */
export const decodeMagicLinkToken = (token) => {
  const [header, payload, signature] = token.split('.');

  const decode = (str) =>
    JSON.parse(
      decodeURIComponent(
        escape(
          atob(
            str
              .replace(/-/g, '+')
              .replace(/_/g, '/')
              .padEnd(str.length + ((4 - (str.length % 4)) % 4), '='),
          ),
        ),
      ),
    );

  try {
    const parsedPayload = decode(payload);
    return {
      userId: parsedPayload.userId || parsedPayload.sub,
      institutionId: parsedPayload.institutionId || parsedPayload.iss,
    };
  } catch (error) {
    throw new Error(`Failed to decode magic link token: ${error.message}`);
  }
};
```

**Testing**: Validate with actual magic link tokens to confirm userId claim name

### Phase 2: Update API Controllers

#### File 1: `src/js/api/controllers/magic-link-controller.js`

**Current**: Lines 20-44
**Changes**:
1. Import decode utility (add after line 5)
2. Extract userId from token (after line 22)
3. Update endpoint URL (line 23)
4. Add token as query parameter
5. Add error handling for token decode failures

**Modified Method**:
```javascript
import { decodeMagicLinkToken } from '../../util/magic-link-token.js';

async redeemMagicLinkToken(institutionId, token) {
  const xhr = this.createXhr_();

  // Extract userId from JWT token
  let userId;
  try {
    const decoded = decodeMagicLinkToken(token);
    userId = decoded.userId;
  } catch (error) {
    this.dispatchEvent(
      new ControllerEvent(
        MagicLinkController.EventType.REDEEM_ERROR,
        400,
        'Invalid magic link token format'
      )
    );
    return Promise.reject(error);
  }

  // New endpoint with userId in path and token as query param
  const url = `${bannoWeb.API_SERVER}/v1/institutions/${institutionId}/users/${userId}/redeem?token=${encodeURIComponent(token)}`;
  const requestBody = await getUaData();

  return xhr
    .put(url, requestBody)
    .then((response) => {
      // Ensure userId is in response for backward compatibility
      const enhancedResponse = {
        ...response,
        userId: userId,
      };
      this.dispatchEvent(
        new ControllerEvent(
          MagicLinkController.EventType.REDEEM_SUCCESS,
          xhr.status,
          '',
          enhancedResponse
        )
      );
    })
    .catch((e) => {
      // Existing error handling remains the same
      switch (e && e.statusCode) {
        case 401:
          this.dispatchEvent(
            new ControllerEvent(
              MagicLinkController.EventType.REDEEM_UNAUTHORIZED,
              e.statusCode
            )
          );
          break;
        default:
          this.dispatchEvent(
            new ControllerEvent(
              MagicLinkController.EventType.REDEEM_ERROR,
              e.statusCode,
              e.response.messages[0]
            )
          );
          break;
      }
      throw e;
    });
}
```

**Note**: Update comment on line 21 from old v0 path to new v1 path

#### File 2: `src/js/api/controllers/user-management-controller.js`

**Current**: Lines 579-587
**Changes**: Similar to magic-link-controller.js

**Modified Method**:
```javascript
import { decodeMagicLinkToken } from '../../util/magic-link-token.js';

async redeemMagicLinkToken(institutionId, token) {
  // Extract userId from JWT token
  const { userId } = decodeMagicLinkToken(token);

  const url = `${bannoWeb.API_SERVER}/v1/institutions/${institutionId}/users/${userId}/redeem?token=${encodeURIComponent(token)}`;
  const requestBody = await getUaData();

  try {
    const response = await this.createXhr_().put(url, requestBody);
    // Ensure userId is in response for backward compatibility
    return {
      ...response,
      userId: userId,
    };
  } catch (error) {
    throw error;
  }
}
```

### Phase 3: Update Mock Data

#### File 1: `mock-data/magic-link-mock-data.js`

**Current**: Line 25 - `/v0\/institutions\/([-a-fA-F0-9]{36})\/token\/.*\/redeem/`
**New**: `/v1\/institutions\/([-a-fA-F0-9]{36})\/users\/([-a-fA-F0-9]{36})\/redeem/`

**Handler Update**:
```javascript
[
  /v1\/institutions\/([-a-fA-F0-9]{36})\/users\/([-a-fA-F0-9]{36})\/redeem/,
  (xhr, data, url) => {
    // Extract userId from URL path
    const userIdMatch = url.match(/\/users\/([-a-fA-F0-9]{36})\//);
    const userId = userIdMatch ? userIdMatch[1] : '00000000-0000-0000-0000-000000000000';

    // Extract token from query params for validation (optional)
    const urlObj = new URL(url, 'http://localhost');
    const token = urlObj.searchParams.get('token');

    xhr.status = 200;
    return {
      userId: userId,
      organizationId: '00000000-0000-0000-0000-000000000000',
      organizationName: 'Dog Waterproofing',
      redirectUri: '/uis-enrollment',
    };
  },
]
```

#### File 2: `mock-data/user-management-mock-data.js`

**Current**: Line 1494 - Similar pattern
**Update**: Apply same regex and handler pattern as above

### Phase 4: Update Tests

#### File: `test/unit/magic-link-controller-spec.js`

**Current State**: Disabled with `xdescribe` (line 13)

**Actions**:
1. Remove `xdescribe` - change back to `describe`
2. Update test expectations for new URL format
3. Add test for token decoding
4. Add test for invalid token format (decode failure)
5. Mock the `decodeMagicLinkToken` utility

**New Test Cases**:
```javascript
describe('redeemMagicLinkToken', () => {
  it('should decode token and call new endpoint with userId in path', () => {
    // Test that userId is extracted from token
    // Test that new URL format is used
    // Test that token is in query params
  });

  it('should handle invalid token format gracefully', () => {
    // Test that decode errors dispatch REDEEM_ERROR event
    // Test that promise is rejected
  });

  // Existing test cases updated with new expectations...
});
```

### Phase 5: Update Type Definitions (Optional)

#### File: `src/js/externs/api/magic-link.js`

**Current**: Lines 8-20 define `MagicLinkResponse`

**Consideration**: No changes needed - response structure remains the same

## Component Impact Analysis

### No Changes Required
The following components will continue to work without modification because they rely on the controller API which we're updating internally:

1. **bannoweb-org-user-invite.js** (src/components/bannoweb/enrollment/)
   - Calls `userManagementController.redeemMagicLinkToken()`
   - Receives userId from response (unchanged)
   - No modifications needed

2. **bannoweb-uis-enroll.js** (src/components/bannoweb/uis-enroll/)
   - Uses magic link flow indirectly
   - No modifications needed

3. **bannoweb-two-factor-auth-landing-page.js**
   - Uses `magicLinkController` instance
   - No modifications needed

## Testing Strategy

### Unit Tests
1. Test token decoding utility with valid JWT tokens
2. Test error handling for malformed tokens
3. Test controller methods call correct endpoint with userId
4. Test response structure compatibility

### Integration Tests
1. Test full org user invite flow
2. Test UIS enrollment flow
3. Test 2FA landing page flow
4. Verify userId extraction and API calls

### E2E Tests
1. Re-enable disabled E2E tests for two-factor-auth-landing-page
2. Test magic link redemption end-to-end
3. Test error scenarios (expired token, invalid token)

### Manual Testing
1. Test with real magic link tokens in dev environment
2. Verify userId claim name in JWT payload
3. Test all error scenarios
4. Verify response compatibility

## Rollout Strategy

### Option 1: Feature Flag (Recommended)
Implement with LaunchDarkly feature flag for gradual rollout:

```javascript
const USE_NEW_MAGIC_LINK_ENDPOINT = 'use-new-magic-link-redeem-endpoint';

async redeemMagicLinkToken(institutionId, token) {
  const useNewEndpoint = await launchDarkly.evaluate(USE_NEW_MAGIC_LINK_ENDPOINT);

  if (useNewEndpoint) {
    return this.redeemWithNewEndpoint(institutionId, token);
  } else {
    return this.redeemWithOldEndpoint(institutionId, token);
  }
}
```

**Rollout Plan**:
1. Deploy with flag OFF (use old endpoint)
2. Enable for internal testing
3. Enable for 10% production traffic
4. Monitor error rates
5. Gradually increase to 100%
6. Remove flag and old code after 2 weeks

### Option 2: Direct Migration
If backend deprecates old endpoints immediately, deploy directly without feature flag.

## Verification Steps

### Before Deployment
- [ ] Unit tests pass
- [ ] Mock data works in local dev
- [ ] Code review completed
- [ ] Type definitions updated if needed

### After Deployment
- [ ] Monitor error rates (401, 400, 500)
- [ ] Verify userId extraction works
- [ ] Check API call success rates
- [ ] Monitor Mixpanel events for org user invites
- [ ] Verify 2FA flow works

## Critical Files Summary

| Purpose | File Path | Lines |
|---------|-----------|-------|
| New token utility | `src/js/util/magic-link-token.js` | NEW FILE |
| Main controller | `src/js/api/controllers/magic-link-controller.js` | 20-44 |
| User mgmt controller | `src/js/api/controllers/user-management-controller.js` | 579-587 |
| Magic link mock data | `mock-data/magic-link-mock-data.js` | 25-33 |
| User mgmt mock data | `mock-data/user-management-mock-data.js` | 1494-1502 |
| Unit tests | `test/unit/magic-link-controller-spec.js` | Full file |
| JWT decode reference | `src/js/util/new-device-jwt.js` | 8-20 (pattern) |

## Documentation Updates

### Code Comments
- Update comment in magic-link-controller.js line 21 (references old v0 path)
- Add JSDoc for new decodeMagicLinkToken function
- Document JWT payload structure expectations

### Team Documentation
- Update internal API integration docs
- Document token structure and userId claim
- Share migration timeline with Android/iOS teams (they also need to migrate)

## Risks & Mitigation

### Risk 1: Incorrect userId Claim Name
**Impact**: Token decode fails, all redemptions fail
**Mitigation**: Verify actual claim name with backend team before deployment
**Fallback**: Support both `userId` and `sub` claims

### Risk 2: Token Format Changes
**Impact**: Decode logic breaks if token isn't JWT
**Mitigation**: Add robust error handling, test with real tokens
**Fallback**: Feature flag to revert to old endpoint

### Risk 3: Response Structure Changes
**Impact**: Components expecting userId in response break
**Mitigation**: Ensure userId always included in response (extract from token)
**Fallback**: Component updates if needed

## Success Criteria

- ✅ All magic link redemptions use new endpoint
- ✅ userId successfully extracted from tokens
- ✅ No increase in error rates
- ✅ All existing flows (org invite, UIS enroll, 2FA) work
- ✅ Tests pass and coverage maintained
- ✅ Android and iOS teams migrated (coordinated)

## Timeline Estimate

- **Phase 1** (Token utility): 2-4 hours
- **Phase 2** (Controllers): 4-6 hours
- **Phase 3** (Mock data): 1-2 hours
- **Phase 4** (Tests): 4-6 hours
- **Phase 5** (Documentation): 2-3 hours
- **Total**: 13-21 hours (~2-3 days)

**Note**: Timeline assumes coordination with backend team to confirm token structure and endpoint availability.
