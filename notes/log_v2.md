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

- Invite to Entra directory and have them accept
- Add to dataspace-developers
- allow for their Ipv4 address

- Get the shared connection, put into backend/.env
- Install the dependencies for their python environment
- install Azure CLI brew install azure-cli openssl
