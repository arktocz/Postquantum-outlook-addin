# Outlook addin template generation:
1. npm install -g yo generator-office
2. yo office
3. Settings:
    - Choose a project type - Office Add-in Task Pane project
    - Choose a script type - JavaScript
    - What do you want to name your add-in? - My Office Add-in
    - Which Office client application would you like to support? - Outlook
    - Which manifest would you like to use? - Add-in only manifest

# manifest.xml edit
- generated template manifest file doesnt allow addin to be visible outside of reading email
- new extesnsion point <"MessageComposeCommandSurface">, form <"ItemEdit"> and <"Rule"> entry need to be added to make addin visible for email compose as well
- re-installation of addin/manifest.xml needs to be done to propagate any changes done in manifest file
