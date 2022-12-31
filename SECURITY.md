# Security Policy

1. [Reporting security problems](#reporting)
2. [Security Bug Bounties](#bounty)

<a name="reporting"></a>
## Reporting security problems to Censo

**DO NOT CREATE AN ISSUE** to report a security problem. Instead, please create
a new security advisory for further discussion
[on github](https://github.com/sooshisan/token-metadata-descriptor/security/advisories/new).

Expect a response as fast as possible, typically within 7 days.

If you do not receive a response within that time frame, please feel free
to send an email to the current core maintainer at sooshisan@pm.me.

As above, please DO NOT include attachments or provide detail regarding the
security issue.

<a name="process"></a>

## Incident Response Process

In case an incident is discovered or reported, the following process will be
followed to contain, respond and remediate:

### 1. Triage

Within the draft security advisory, discuss and determine the severity of the
issue. If it is determined that this not a critical issue then the advisory
should be closed and if more follow-up is required a normal public github issue
should be created.

### 2. Prepare Fixes

For the affected branches, prepare a fix for the issue and push them to the
corresponding branch in the private repository associated with the draft
security advisory. There is no CI available in the private repository so you
must build from source and manually verify fixes. Code review from the reporter
is ideal, as well as from multiple members of the core maintainers.

### 3. Notify Integrations

Once an ETA is available for the fix, a member of the core maintainers should
notify operators of integrations so they can prepare for an update. If the
program accrues a large number of users, it's critical to provide actionable
information at the right time. We don't want to push any surprises that
inconveniences everyone.

### 4. Ship the patch

Once the fix is accepted, a member of the core maintainers should prepare
a new build and deploy it on mainnet.

### 5. Public Disclosure and Release

Once the fix has been deployed, the patches from the security advisory may be
merged into the main source repository. A new official release should be shipped
and all integrations are requested to upgrade as quickly as possible.

### Payment of Bug Bounties:

This project is currently an open-source community project, so there are no funds
to pay bug bounties.
