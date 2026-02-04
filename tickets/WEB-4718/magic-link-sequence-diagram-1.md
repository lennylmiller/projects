# Magic Link UML Documentation Suite

This document provides a comprehensive UML documentation of the Magic Link feature in Banno Online, organized from high-level use cases down to detailed implementation diagrams.

**Note:** All diagrams use PlantUML syntax. To render them, use a PlantUML viewer, IDE plugin, or online tool like [PlantText](https://www.planttext.com/) or [PlantUML Server](http://www.plantuml.com/plantuml/).

---

## Table of Contents

### Level 1: Use Cases (What the system does)
- [Use Case Diagram](#use-case-diagram)

### Level 2: Sequence Diagrams (How objects interact)
- [Flow 1: Organization User Invitation](#flow-1-organization-user-invitation-with-api-migration)
- [Flow 2: 2FA Setup](#flow-2-organization-user-invitation-with-2fa-required)
- [Flow 3: Account Recovery](#flow-3-account-recovery-via-magic-link)
- [Flow 4: Error Handling](#flow-4-error-handling)

### Level 3: Activity Diagrams (Process details)
- [Activity: Token Decoding Process](#activity-token-decoding-process)
- [Activity: Credential Validation Flow](#activity-credential-validation-flow)
- [Activity: 2FA Verification Flow](#activity-2fa-verification-flow)

### Level 4: Class Diagrams (Static structure)
- [Class: MagicLinkController](#class-magiclinkcontroller)
- [Class: Controllers Overview](#class-controllers-overview)

### Reference
- [API Endpoints Summary](#api-endpoints-summary)
- [Key Files Reference](#key-files-reference)
- [Event Types Reference](#event-types-reference)

---

## Overview

Magic links are **single-use JWT tokens** embedded in URLs that authenticate users without passwords. They are used for:

1. **Organization User Invitations** - Inviting new users to join an organization
2. **First Admin 2FA Setup** - Setting up two-factor authentication for first admins
3. **Account Recovery** - Password reset via email/SMS

---

## Document Hierarchy

```plantuml
@startuml
!theme plain

rectangle "Use Case Diagram" as UC #LightBlue
rectangle "Sequence Diagrams" as SD #LightGreen
rectangle "Activity Diagrams" as AD #LightYellow
rectangle "Class Diagrams" as CD #LightPink

UC --> SD : "What does the system do?"
SD --> AD : "How do objects interact?"
SD --> CD
AD --> CD : "What are the process steps?"

note right of CD : "What is the structure?"
@enduml
```

---

# Level 1: Use Case Diagram

## Use Case Diagram

This diagram shows the actors (users and external systems) and the use cases (system functionalities) for the Magic Link feature.

```plantuml
@startuml
!theme plain
left to right direction
skinparam packageStyle rectangle

actor "Admin" as Admin
actor "End User" as User
actor "Email Service" as EmailSvc <<system>>
actor "Consumer API" as ConsumerAPI <<system>>

rectangle "Magic Link System" {
    usecase "Invite Organization User" as UC1
    usecase "Redeem Magic Link Token" as UC2
    usecase "Setup First Admin 2FA" as UC3
    usecase "Recover Account" as UC4
    usecase "Reset Password" as UC5
}

Admin --> UC1
UC1 --> EmailSvc

User --> UC2
User --> UC3
User --> UC4
User --> UC5

UC2 --> ConsumerAPI
UC3 --> ConsumerAPI
UC4 --> ConsumerAPI
UC4 --> EmailSvc
UC5 --> ConsumerAPI

UC1 ..> UC2 : <<includes>>
UC4 ..> UC5 : <<includes>>
UC2 ..> UC3 : <<extends>>
@enduml
```

### Actors

| Actor | Description |
|-------|-------------|
| **Admin** | Organization administrator who invites new users |
| **End User** | Person receiving and using magic links |
| **Email Service** | External service that delivers magic link emails/SMS |
| **Consumer API** | Backend API that validates tokens and manages sessions |

### Use Cases

| Use Case | Description | Primary Actor |
|----------|-------------|---------------|
| **Invite Organization User** | Admin creates invitation, system sends magic link | Admin |
| **Redeem Magic Link Token** | User clicks link, system validates token and creates session | End User |
| **Setup First Admin 2FA** | First admin must complete 2FA before credential setup | End User |
| **Recover Account** | User requests password recovery via magic link | End User |
| **Reset Password** | User sets new password after magic link verification | End User |

---

# Level 2: Sequence Diagrams

---

## Flow 1: Organization User Invitation (with API Migration)

This is the primary magic link flow when a user is invited to join an organization.

**Note:** Step 3 shows both the deprecated and current API endpoints for token redemption. See [Activity: Token Decoding Process](#activity-token-decoding-process) for details on the new JWT decoding step.

```plantuml
@startuml
!theme plain
autonumber

actor "Admin" as Admin
participant "Email Service" as Email
actor "New User" as User
participant "Browser" as Browser
participant "OrgUserInvite\nComponent" as Component
participant "Controller" as Controller
participant "Consumer API" as API
database "Database" as DB

== Step 1: Invitation Generation ==
Admin -> API : Create user invitation
API -> DB : Generate JWT token
DB --> API : Token created
API -> Email : Send invitation email
Email --> User : Email with magic link

== Step 2: User Clicks Magic Link ==
User -> Browser : Clicks magic link in email
Browser -> Component : Navigate to /org-user-invite/:token
Component -> Component : Extract magicLinkToken from URL

== Step 3: Token Redemption (API MIGRATION) ==
Component -> Controller : redeemMagicLinkToken(institutionId, token)

group #Pink DEPRECATED: Legacy Endpoint (token in path)
    note right of Controller : Old implementation
    Controller -> API : PUT /v1/institutions/{id}/token/{token}/redeem
    API -> DB : Validate token
    DB --> API : Token valid
    API --> Controller : 200 OK + {userId, orgId, orgName}
end

group #LightGreen CURRENT: New Endpoint (userId in path)
    note right of Controller : New implementation with JWT decode
    Controller -> Controller : decodeMagicLinkToken(token)
    note right of Controller : Extract userId from JWT payload
    Controller -> API : PUT /v1/institutions/{id}/users/{userId}/redeem?token=...
    API -> DB : Validate token
    DB --> API : Token valid
    API --> Controller : 200 OK + {orgId, orgName}
    Controller -> Controller : Merge userId into response
end

API -> API : Set JWT session cookie
Controller --> Component : {userId, orgId, orgName}

== Step 4: Credential Setup ==
Component -> API : GET username rules
Component -> API : GET password rules
API --> Component : Validation rules
Component -> User : Show credential form
User -> Component : Enter username + password
Component -> API : POST save credentials
API -> DB : Create user account
DB --> API : Account created
API --> Component : 200 OK
Component -> User : Success! Redirect to login

@enduml
```

### API Migration Summary

| Aspect | Deprecated (Legacy) | Current (New) |
|--------|---------------------|---------------|
| **Endpoint** | `/v1/institutions/{id}/token/{token}/redeem` | `/v1/institutions/{id}/users/{userId}/redeem?token=...` |
| **Token location** | In URL path | In query parameter |
| **userId source** | Returned from API | Decoded from JWT client-side |
| **Client-side step** | None | Decode JWT to extract userId |

---

## Flow 2: Organization User Invitation with 2FA Required

When the first admin of an organization needs to set up 2FA before creating credentials.

```plantuml
@startuml
!theme plain
autonumber

actor "First Admin" as User
participant "Browser" as Browser
participant "OrgUserInvite" as InviteComp
participant "2FA Landing Page" as TwoFAComp
participant "MagicLinkController" as MagicLinkCtrl
participant "Consumer API" as API

== Token Redemption (redirects to 2FA) ==
User -> Browser : Click magic link
Browser -> InviteComp : /org-user-invite/:token
InviteComp -> API : PUT /v1/institutions/{id}/token/{token}/redeem
API --> InviteComp : 200 OK + {redirectUri: "2fa-landing-page/OrgName"}
InviteComp -> Browser : Redirect to /2fa-landing-page/OrgName

== 2FA Phone Selection ==
Browser -> TwoFAComp : Load 2FA landing page
TwoFAComp -> MagicLinkCtrl : getPhoneNumbers()
MagicLinkCtrl -> API : GET /v0/first-admin-2fa/phone-numbers
API --> MagicLinkCtrl : [{type: "mobile", masked: "***-***-1234"}]
MagicLinkCtrl --> TwoFAComp : Phone numbers list
TwoFAComp -> User : Show phone selection UI

== Send Verification Code ==
User -> TwoFAComp : Select phone + delivery method (SMS/Voice)
TwoFAComp -> MagicLinkCtrl : postVerificationCode("mobile", "sms")
MagicLinkCtrl -> API : POST /v0/first-admin-2fa/otp
API --> MagicLinkCtrl : 204 No Content (code sent)
MagicLinkCtrl --> TwoFAComp : SEND_CODE_SUCCESS
TwoFAComp -> User : Show code input form

== Verify Code & Complete ==
User -> TwoFAComp : Enter verification code
TwoFAComp -> MagicLinkCtrl : verify2faCode("123456")
MagicLinkCtrl -> API : POST /v1/first-admin-2fa/otp/verify
API --> MagicLinkCtrl : 200 OK + {redirectUri: "/org-user-invite/..."}
MagicLinkCtrl --> TwoFAComp : VERIFY_2FA_CODE_SUCCESS
TwoFAComp -> Browser : Redirect back to invitation flow
Browser -> User : Continue with credential setup

@enduml
```

---

## Flow 3: Account Recovery via Magic Link

When a user forgets their password and uses a magic link for recovery.

```plantuml
@startuml
!theme plain
autonumber

actor "User" as User
participant "Browser" as Browser
participant "AccountRecovery\nComponent" as Recovery
participant "AccountRecovery\nController" as RecoveryCtrl
participant "Consumer API" as API
participant "Email/SMS" as Channel

== Step 1: User Identification ==
User -> Browser : Navigate to /forgot
Browser -> Recovery : Load recovery form
Recovery -> User : Show identification form
User -> Recovery : Enter SSN + Account Number\nOR Username + Email
Recovery -> RecoveryCtrl : lookupUser(identifier, account)
RecoveryCtrl -> API : POST /v0/recovery/lookup
API --> RecoveryCtrl : {type: "SELECT_LINK_CHANNEL", channels: [...]}

== Step 2: Delivery Channel Selection ==
RecoveryCtrl --> Recovery : NEED_SELECT_LINK_CHANNEL
Recovery -> User : Show delivery options (email/SMS)
User -> Recovery : Select email delivery
Recovery -> RecoveryCtrl : selectLinkDeliveryChannel("email")
RecoveryCtrl -> API : POST /recovery/magic-links/send
API -> Channel : Send magic link email
Channel --> User : Recovery email received
API --> RecoveryCtrl : 200 OK
RecoveryCtrl --> Recovery : Magic link sent
Recovery -> User : "Check your email"

== Step 3: Magic Link Verification ==
User -> Browser : Click link in email
Browser -> Recovery : /forgot/:recoveryLinkId
Recovery -> RecoveryCtrl : verifyRecoveryLinkId(linkId)
RecoveryCtrl -> API : POST /recovery/magic-links/{linkId}/verify
API --> RecoveryCtrl : 200 OK (session established)

== Step 4: Password Reset ==
RecoveryCtrl --> Recovery : Verification success
Recovery -> User : Show password reset form
User -> Recovery : Enter new password
Recovery -> API : POST /recovery/password
API --> Recovery : 200 OK
Recovery -> User : Password reset! Login now

@enduml
```

---

## Flow 4: Error Handling

Common error scenarios in magic link flows.

```plantuml
@startuml
!theme plain
autonumber

actor "User" as User
participant "Component" as Component
participant "Controller" as Controller
participant "API" as API

== Scenario A: Expired/Invalid Token ==
User -> Component : Click old magic link
Component -> Controller : redeemMagicLinkToken(token)
Controller -> API : PUT .../token/{token}/redeem
API --> Controller : 401 Unauthorized
Controller --> Component : REDEEM_UNAUTHORIZED event
Component -> User : "Invitation link failed"\n"Request another invite"

== Scenario B: Wrong 2FA Code ==
User -> Component : Enter wrong verification code
Component -> Controller : verify2faCode("wrong")
Controller -> API : POST .../otp/verify
API --> Controller : 403 Forbidden
Controller --> Component : VERIFY_2FA_CODE_FORBIDDEN
Component -> User : "Incorrect code, try again"

== Scenario C: Server Error ==
User -> Component : Submit form
Component -> Controller : API call
Controller -> API : Request
API --> Controller : 500 Internal Server Error
Controller --> Component : *_ERROR event
Component -> User : Generic error message

@enduml
```

---

# Level 3: Activity Diagrams

Activity diagrams zoom into specific processes from the sequence diagrams, showing decision points and detailed workflow steps.

---

## Activity: Token Decoding Process

This diagram details the token decoding step introduced in the API migration. It shows how the controller extracts `userId` from the JWT token before making the API call.

**Referenced from:** [Flow 1: Step 3 - Token Redemption](#flow-1-organization-user-invitation-with-api-migration)

```plantuml
@startuml
!theme plain
start

:Token Received;

if (Is token a non-empty string?) then (No)
    :Throw: Invalid token - must be non-empty string;
    :Dispatch REDEEM_ERROR event;
    stop
else (Yes)
    :Split token by dots;
endif

if (Has 3 parts?) then (No)
    :Throw: Invalid token format - expected JWT with 3 parts;
    :Dispatch REDEEM_ERROR event;
    stop
else (Yes)
    :Base64URL decode payload;
    :Parse JSON from payload;
endif

if (Extract userId or sub claim) then (Not found)
    :Throw: userId not found in token payload;
    :Dispatch REDEEM_ERROR event;
    stop
else (Found)
    :Return userId;
    :Build new endpoint URL with userId in path;
    :PUT to /v1/.../users/userId/redeem?token=...;
    stop
endif

@enduml
```

### Token Structure

```
header.payload.signature
   │      │        │
   │      │        └── Cryptographic signature (not decoded client-side)
   │      └── Base64URL encoded JSON with userId claim
   └── Base64URL encoded JSON with algorithm info
```

---

## Activity: Credential Validation Flow

This diagram shows the real-time validation process when users enter their username and password during enrollment.

**Referenced from:** [Flow 1: Step 4 - Credential Setup](#flow-1-organization-user-invitation-with-api-migration)

```plantuml
@startuml
!theme plain
start

:User types in form;

switch (Which field?)
case (Username)
    :Debounce 700ms;
    if (Length > 0?) then (No)
        :Clear username errors;
    else (Yes)
        :API: validateUsername;
        if (Valid?) then (Yes)
            :Clear username errors;
        else (No)
            :Show failed rules;
        endif
    endif
case (Password)
    :Debounce 700ms;
    if (Length > 0?) then (No)
        :Clear password errors;
    else (Yes)
        :API: validatePassword;
        if (Valid?) then (Yes)
            :Clear password errors;
        else (No)
            :Show failed rules;
        endif
        :Re-validate confirm password;
    endif
case (Confirm Password)
    :Debounce 400ms;
    if (Length > 0?) then (No)
        :Skip validation;
    else (Yes)
        if (Matches password?) then (Yes)
            :Clear confirm errors;
        else (No)
            :Show "passwords do not match";
        endif
    endif
endswitch

:Check if submit enabled;

if (All fields valid and filled?) then (Yes)
    :Enable submit button;
else (No)
    :Disable submit button;
endif

stop

@enduml
```

---

## Activity: 2FA Verification Flow

This diagram shows the two-factor authentication verification process for first admin users.

**Referenced from:** [Flow 2: 2FA Setup](#flow-2-organization-user-invitation-with-2fa-required)

```plantuml
@startuml
!theme plain
start

:2FA Required;
:GET /v0/first-admin-2fa/phone-numbers;

switch (Response?)
case (401 Unauthorized)
    :Show session expired error;
    stop
case (500 Error)
    :Show server error;
    stop
case (200 OK)
    :Display masked phone options;
endswitch

:User selects phone + method;
:POST /v0/first-admin-2fa/otp;

switch (Response?)
case (400 Bad Request)
    :Show invalid phone error;
    stop
case (401 Unauthorized)
    :Show session expired error;
    stop
case (204 No Content)
    :Display code input form;
endswitch

repeat
    :User enters 6-digit code;
    :POST /v1/first-admin-2fa/otp/verify;
    
    switch (Response?)
    case (401 Unauthorized)
        :Show session expired error;
        stop
    case (403 Forbidden)
        :Show "incorrect code - try again";
    case (200 OK)
        :Extract redirectUri from response;
        :Redirect to org-user-invite flow;
        :Continue with credential setup;
        stop
    endswitch
repeat while (Wrong code?) is (Yes)

@enduml
```

---

# Level 4: Class Diagrams

Class diagrams show the static structure of the system - the classes, their attributes, methods, and relationships.

---

## Class: MagicLinkController

This diagram shows the `MagicLinkController` class and its relationship to the new `decodeMagicLinkToken` utility.

**Referenced from:** All sequence diagrams using `MagicLinkController`

```plantuml
@startuml
!theme plain

class MagicLinkController {
    +institution : Institution
    +redeemMagicLinkToken(institutionId, token) : Promise
    +getPhoneNumbers() : Promise
    +postVerificationCode(numberType, method) : Promise
    +verify2faCode(code) : Promise
    -createXhr_() : XhrPromise
    +dispatchEvent(event) : void
}

enum MagicLinkControllerEventType {
    REDEEM_SUCCESS
    REDEEM_UNAUTHORIZED
    REDEEM_ERROR
    PHONE_NUMBERS_SUCCESS
    PHONE_NUMBERS_UNAUTHORIZED
    PHONE_NUMBERS_ERROR
    SEND_CODE_SUCCESS
    SEND_CODE_BAD_REQUEST
    SEND_CODE_UNAUTHORIZED
    SEND_CODE_ERROR
    VERIFY_2FA_CODE_SUCCESS
    VERIFY_2FA_CODE_UNAUTHORIZED
    VERIFY_2FA_CODE_FORBIDDEN
    VERIFY_2FA_CODE_ERROR
}

class decodeMagicLinkToken <<utility>> {
    +decodeMagicLinkToken(token) : Object
    -decodeBase64Url(str) : Object
}

class ControllerEvent {
    +type : string
    +status : number
    +message : string
    +response : Object
}

MagicLinkController ..> decodeMagicLinkToken : uses
MagicLinkController ..> ControllerEvent : creates
MagicLinkController --> MagicLinkControllerEventType : dispatches

@enduml
```

---

## Class: Controllers Overview

This diagram shows the relationship between the main controllers involved in magic link flows.

```plantuml
@startuml
!theme plain

abstract class Controller {
    #createXhr_() : XhrPromise
    +dispatchEvent(event) : void
}

class MagicLinkController {
    +institution : Institution
    +redeemMagicLinkToken(institutionId, token)
    +getPhoneNumbers()
    +postVerificationCode(numberType, method)
    +verify2faCode(code)
}

class UserManagementController {
    +user : User
    +subUsers : SubUsers
    +institution : Institution
    +redeemMagicLinkToken(institutionId, token)
    +orgUserSaveCreds(username, password, token, userId)
    +validateUsername(userId, username)
    +validatePassword(userId, password)
    +getOrgUserUsernameRules(userId)
    +getOrgUserPasswordRules(userId)
}

class AccountRecoveryController {
    +lookupUser(identifier, accountNumberOrEmail)
    +selectLinkDeliveryChannel(method)
    +verifyRecoveryLinkId(recoveryLinkId)
}

class decodeMagicLinkToken <<utility>> {
    +decodeMagicLinkToken(token) : Object
}

Controller <|-- MagicLinkController
Controller <|-- UserManagementController
Controller <|-- AccountRecoveryController

MagicLinkController ..> decodeMagicLinkToken : uses
UserManagementController ..> decodeMagicLinkToken : uses

@enduml
```

---

# Reference

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/institutions/{id}/users/{userId}/redeem?token=...` | PUT | Redeem invitation magic link (CURRENT) |
| `/v1/institutions/{id}/token/{token}/redeem` | PUT | Redeem invitation magic link (DEPRECATED) |
| `/v0/first-admin-2fa/phone-numbers` | GET | Get masked phone numbers for 2FA |
| `/v0/first-admin-2fa/otp` | POST | Send 2FA verification code |
| `/v1/first-admin-2fa/otp/verify` | POST | Verify 2FA code |
| `/v0/recovery/lookup` | POST | Initiate account recovery |
| `/recovery/magic-links/send` | POST | Send recovery magic link |
| `/recovery/magic-links/{id}/verify` | POST | Verify recovery link |

---

## Key Files Reference

| File | Description |
|------|-------------|
| `src/js/util/magic-link-token.js` | **NEW** - JWT token decoder utility for extracting userId |
| `src/js/api/controllers/magic-link-controller.js` | Core controller for magic link + 2FA APIs |
| `src/js/api/controllers/user-management-controller.js` | User management including token redemption |
| `src/js/api/controllers/account-recovery-controller.js` | Account recovery flows |
| `src/components/bannoweb/enrollment/bannoweb-org-user-invite.js` | UI for invitation flow |
| `src/components/bannoweb/two-factor-auth/bannoweb-two-factor-auth-landing-page.js` | 2FA setup UI |
| `src/components/bannoweb/account-recovery/bannoweb-account-recovery.js` | Recovery flow UI |

---

## Event Types Reference

The `MagicLinkController` dispatches these events:

```javascript
MagicLinkController.EventType = {
  // Token redemption
  REDEEM_SUCCESS: 'redeem-success',
  REDEEM_UNAUTHORIZED: 'redeem-unauthorized',      // 401 - invalid token
  REDEEM_ERROR: 'redeem-error',                    // 500 - server error

  // Phone numbers
  PHONE_NUMBERS_SUCCESS: 'phone-numbers-success',
  PHONE_NUMBERS_UNAUTHORIZED: 'phone-numbers-unauthorized',
  PHONE_NUMBERS_ERROR: 'phone-numbers-error',

  // Send verification code
  SEND_CODE_SUCCESS: 'send-code-success',
  SEND_CODE_BAD_REQUEST: 'send-code-bad-request',  // 400 - invalid phone
  SEND_CODE_UNAUTHORIZED: 'send-code-unauthorized',
  SEND_CODE_ERROR: 'send-code-error',

  // Verify 2FA code
  VERIFY_2FA_CODE_SUCCESS: 'verify-2fa-code-success',
  VERIFY_2FA_CODE_UNAUTHORIZED: 'verify-2fa-code-unauthorized',
  VERIFY_2FA_CODE_FORBIDDEN: 'forbidden',          // 403 - wrong code
  VERIFY_2FA_CODE_ERROR: 'verify-2fa-code-error',
};
```
