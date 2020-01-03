﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.TraceExtensions;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Microsoft.BotBuilderSamples
{
    public class AdapterWithErrorHandler : BotFrameworkHttpAdapter
    {
        //Create field for telemetry client. Add IBotTelemetryClient parameter to AdapterWithErrorHandler
        private IBotTelemetryClient _adapterBotTelemetryClient;

        public AdapterWithErrorHandler(ICredentialProvider credentialProvider, ILogger<BotFrameworkHttpAdapter> logger, IMiddleware middleware, IBotTelemetryClient botTelemetryClient, ConversationState conversationState = null)
            : base(credentialProvider)
        {
            Use(middleware);

            //Use telemetry client so that we can trace exceptions into Application Insights
            _adapterBotTelemetryClient = botTelemetryClient;

            OnTurnError = async (turnContext, exception) =>
            {
                // Track exceptions into Application Insights
                // Set up some properties for our exception tracing to give more information
                var properties = new Dictionary<string, string>
                {{"Bot exception caught in", $"{nameof(AdapterWithErrorHandler)} - {nameof(OnTurnError)}"}};

                //Send the exception telemetry:
                _adapterBotTelemetryClient.TrackException(exception, properties);                

                // Log any leaked exception from the application.
                logger.LogError(exception, $"[OnTurnError] unhandled error : {exception.Message}");

                // Send a message to the user
                await turnContext.SendActivityAsync("The bot encounted an error or bug.");
                await turnContext.SendActivityAsync("To continue to run this bot, please fix the bot source code.");

                if (conversationState != null)
                {
                    try
                    {
                        // Delete the conversationState for the current conversation to prevent the
                        // bot from getting stuck in a error-loop caused by being in a bad state.
                        // ConversationState should be thought of as similar to "cookie-state" in a Web pages.
                        await conversationState.DeleteAsync(turnContext);
                    }
                    catch (Exception e)
                    {
                        logger.LogError(e, $"Exception caught on attempting to Delete ConversationState : {e.Message}");
                    }
                }

                // Send a trace activity, which will be displayed in the Bot Framework Emulator
                await turnContext.TraceActivityAsync("OnTurnError Trace", exception.Message, "https://www.botframework.com/schemas/error", "TurnError");
            };
        }
    }
}
