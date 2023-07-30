# VideoStreamingService

### Setup guide:
<ol>
  <li>Create new database in Server Explorer</li>
  <li>Change DefaultConnection in appsettings.json to new connection string from properties from your new connection</li>
  <li>Open Package Manager Console and type 
    
    update-database
  </li>
  <li>In database add parameters from VideoVisibilityEnum and RoleEnum (Models folder) into VideoVisibility and Roles (make sure the id's match)</li>
  <li>Create user through the UI and change role to "Developer"</li>
</ol>
