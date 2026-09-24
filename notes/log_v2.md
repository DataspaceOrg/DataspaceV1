** Seperate Log tracking Meeting Notes, Personal Progress after acceptance into UAIS **

## Sept 23, 2026

- Configured dataspace-dev database in Azure.
- Added dataspace-developers group inside of Azure.
- From my default directory Go to Microsoft Entra Admin Center > Users > All user > New User > Invite External User
- Add them to the group.
- They will have access to connect to the database through their Entra ID.

Added:
.env with Azure_tenant_id, external invites can recieve an invitation and membership into dataspace-developers.
Use the same tenant_id configuration

Each teammate signs in with their own account, when the script opens the browser the shared settings identify the destination; their group membership grants access.
