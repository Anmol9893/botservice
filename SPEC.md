This specification outlines the requirements for botbuilder samples.

## Goals
- Make it easy for developers to learn basic bot concepts
- Provide a numbering scheme for samples so developers can start simple and layer in sophistication
- Samples targeted at scenarios rather than technology involved
- Consistent set of samples across supported languages
- Samples are also consistently used in the docs topics for continuity and are developed by the documentation team, reviewed by the feature team.
- Each sample MUST include
    - README with steps to run the sample, concepts involved and links to additional reading (docs)
    - Deep link to V4 Emulator, include a .bot file as well as point to relevant tools (UI based or CLI) as appropriate
    - .chat files as appropriate that provide scenario overview and demonstrates how to construct mock conversations for the specific scenario
    - .lu files as appropriate
    - Include source JSON model files for LUIS, QnA, Dispatch where applicable
    - Include LUISGen strong typed LUIS class for LUIS samples
    - Any required build scripts for sample to work locally
    - Well defined naming convention for setting, service endpoint, and secrets in setting files (.bot, app.json, etc.)
    - Deploy to Azure button including all resources (similar to V3 samples)
- All samples are built and deployable on local dev env (Emulator) and Azure (WebChat)
    - Samples (and docs) should add channel specific notes (if applicable). e.g. document list of supported channels for Adaptive cards sample etc.

## Samples structure - C#
    | - <sampleName>.bot                        // bot file for this sample
    | - README.md                               // Markdown readme file that includes steps to run this sample 
                                                (including steps to create and configure required services), 
                                                overview of concepts covered in this sample + links to 
                                                additional topics to read
    | - Program.cs                              // Default program.cs
    | - Startup.cs                              // Default startup.cs – configuration builder + middlewares
    | - appsettings.json                        // Has bot configuration information
    
    | - Dialogs    
        | - MainDialog
            | - MainDialog.cs                   // Main router/ dispatcher for the bot
            | - <botName_state>.cs              // state definitions that are shared across dialogs/ components are here
            | - Resources
                | - <scenario>.lu               // LU file that has intents that apply globally - e.g. help/ cancel etc.
                | - <scenario_card>.cshtml      // Cards that are shared across dialogs.                 
      | - <scenario name>           
            | - <scenario>.cs                   // Dialog definition for this scenario
            | - <scenario_state>.cs             // State object definitions for this scenario
            | - Resources
                  | - <scenario>.lu             // LU file with intents + entities/ QnA pairs for this scenario
                  | - <scenario_card>.cshtml    // cards for this particular scenario – template file for cards
                  | - <scenario>.chat           // Chat file for this specific scenario; shows happy path or variations.
    | - CognitiveModels
        | - <bot_name>.luis                     // LUIS model file for this sample
        | - <bot_name>.qna                      // QnA Maker JSON model file
        | - <bot_name>.dispatch                 // Dispatch JSON model file
    | - DeploymentScripts
        | - DEPLOYMENT.md                       // Readme for deployment scripts.   
        | - azuredeploy.json                    // Azure deployment ARM template

## Samples structure - JS

    | - <sample-name>.bot                       // bot file for this sample
    | - README.md                               // Markdown readme file that includes steps to run this sample 
                                                (including steps to create and configure required services), 
                                                overview of concepts covered in this sample + links to 
                                                additional topics to read
    | - index.js                                // Default app.js - startup, middlewares
    | - .env                                    // Has bot configuration information
    | - dialogs 
        | - mainDialog
            | - index.js                        // Main router/ dispatcher for the bot
            | - <bot-name-state>.js             // state definitions that are shared across dialogs/ components are here
            | - resources
                | - <scenario>.lu               // LU file that has intents that apply globally - e.g. help/ cancel etc.                    
      | - <scenario-name>           
            | - index.js                        // Dialog definition for this scenario
            | - <scenario-state>.js             // State object definitions for this scenario
            | - resources
                  | - <scenario>.lu             // LU file with intents + entities/ QnA pairs for this scenario
                  | - <scenario-card>.json      // cards for this particular scenario – template file for cards
                  | - <scenario>.chat           // Chat file for this specific scenario; shows happy path or variations.
    | - cognitiveModels
        | - <bot-name>.luis                     // LUIS model file for this sample
        | - <bot-name>.qna                      // QnA Maker JSON model file
        | - <bot-name>.dispatch                 // Dispatch JSON model file
    | - deploymentScripts
        | - DEPLOYMENT.md                       // Readme for deployment scripts.   
        | - azuredeploy.json                    // Azure deployment ARM template

## README.md template
```markdown
<INSERT AT MOST ONE PARAGRAPH DESCRIPTION OF WHAT THIS SAMPLE DOES> 

# Concepts introduced in this sample
<DESCRIPTION OF THE CONCEPTS>


# To try this sample
-	<STEPS TO CLONE REPO AND GET SETUP>
## Prerequisites
-	<REQUIRED TOOLS, VERSIONS>
-	<STEPS TO GET SET UP WITH THE SAMPLE. E.g. RUN AN INCLUDED SCRIPT OR MANUALLY DO SOMETHING ETC>

NOTE: <ANY NOTES ABOUT THE PREREQUISITES OR ALTERNATE THINGS TO CONSIDER TO GET SET UP>

## Visual studio
-	<STEPS TO RUN THIS SAMPLE FROM VISUAL STUDIO>

## Visual studio code
-	<STEPS TO RUN THIS SAMPLE FROM VISUAL STUDIO CODE>

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

## Connect to bot using Bot Framework Emulator **V4**
- Launch Bot Framework Emulator
- File -> Open bot and navigate to samples\8.AspNetCore-LUIS-Bot folder
- Select AspNetCore-LUIS-Bot.bot file

# Further reading
-	<LINKS TO ADDITIONAL READING>
```

## Samples repo structure, naming conventions
-	All samples will live under the BotBuilder-Samples repository, master branch. 
-	Language/ platform specific samples go under respective folders – ‘dotnet’/ ‘JS’/ ‘Java’/ ‘Python’
-	Samples should use published packages, available on NuGet or npmjs
-	Each sample sits in its own folder
-	Each sample folder is named as “\<\#\>. \<KEY SCENARIO INTRODUCED BY THE SAMPLE\>”
-	Each solution/ project is named as “\<KEY SCENARIO INTRODUCED BY THE SAMPLE\>”
-	C# - each sample has its own solution file

## Linting

All samples must have the following linting configuration enabled.
<TBD>