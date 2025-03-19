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

# AES module
- npm install crypto-js
- this module is needed to source AES functions

# MlKem/Kyber module
- npm install mlkem
- this module is needed to source mlkem functions
- github.com/dajiaji/crystals-kyber-js

# Adition of polifills
- some used modules are not suited for browser environment, so these polifills function as fallbacks:
- crypto-browserify
- vm-browserify
- stream-browserify
- instalation:
    -npm install crypto-browserify vm-browserify stream-browserify
- editation of module.exports in webpack.config.js:
    ```
    resolve: {
      extensions: [".html", ".js"],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        vm: require.resolve("vm-browserify"),
        stream: require.resolve("stream-browserify"),
         // Since 'fs' is also causing issues, disable it for browser builds
      }
    }
    ```

# Editation of taskpane.html and taskpane.js
- those files are responsible for basic looks and functionality of the addin


