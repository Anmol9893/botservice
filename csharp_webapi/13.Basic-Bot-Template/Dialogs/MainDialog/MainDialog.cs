﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace BasicBot
{
    /// <summary>
    /// The <see cref="MainDialog"/> is first dialog that runs after a user begins a conversation.
    /// </summary>
    /// <remarks>
    /// The <see cref="MainDialog"/> responsibility is to:
    /// - Start message.
    ///   Display the inital message the user sees when they begin a conversation.
    /// - Help.
    ///   Provide the user about the commands the bot can process.
    /// - Start other dialogs to perform more complex operations.
    ///   Begin the <see cref="GreetingDialog"/> if the user greets the bot, which will
    ///   prompt the user for name and city.
    /// </remarks>
    public class MainDialog : RouterDialog
    {
        // Supported LUIS Main Dialog Intents
        public const string GreetingIntent = "Greeting";
        public const string HelpIntent = "Help";

        /// <summary>
        /// Key in the bot config (.bot file) for the LUIS instance.
        /// In the .bot file, multiple instances of LUIS can be configured.
        /// </summary>
        public static readonly string LuisKey = "BasicBotLUIS";

        private readonly BotServices _services;

        public MainDialog(BotServices services, BasicBotAccessors accessors)
                    : base(nameof(MainDialog))
        {
            _services = services ?? throw new ArgumentNullException(nameof(services));

            AddDialog(new GreetingDialog(services, accessors.DialogStateProperty, accessors.GreetingStateProperty));
            AddDialog(new NamePrompt(nameof(NamePrompt)));
            AddDialog(new CityPrompt(nameof(CityPrompt)));
        }

        protected override async Task OnStartAsync(DialogContext innerDc, CancellationToken cancellationToken = default(CancellationToken))
        {
            var context = innerDc.Context;
            var activity = context.Activity;

            if (activity.MembersAdded.Any())
            {
                // Iterate over all new members added to the conversation
                foreach (var member in activity.MembersAdded)
                {
                    // Greet anyone that was not the target (recipient) of this message
                    // the 'bot' is the recipient for events from the channel,
                    // turnContext.Activity.MembersAdded == turnContext.Activity.Recipient.Id indicates the
                    // bot was added to the conversation.
                    // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
                    if (member.Id != activity.Recipient.Id)
                    {
                        var welcomeCard = CreateAdaptiveCardAttachment();
                        var response = CreateResponse(context.Activity, welcomeCard);
                        await context.SendActivityAsync(response).ConfigureAwait(false);
                    }
                }
            }
        }

        protected override async Task RouteAsync(DialogContext dc, CancellationToken cancellationToken = default(CancellationToken))
        {
            // Perform a call to LUIS to retrieve results for the current activity message.
            var luisResults = await _services.LuisServices[LuisKey].RecognizeAsync(dc.Context, cancellationToken).ConfigureAwait(false);
            var topScoringIntent = luisResults?.GetTopScoringIntent();
            var topIntent = topScoringIntent.Value.intent;

            var interruptResult = InterruptionStatus.NoAction;
            if (topIntent != null)
            {
                // See if there are any conversation interrupts we need to handle
                switch (topIntent)
                {
                    case GreetingIntent:
                        await dc.BeginDialogAsync(nameof(GreetingDialog), null, cancellationToken);
                        break;

                    case HelpIntent:
                        interruptResult = await OnMainHelpAsync(dc).ConfigureAwait(false);
                        break;

                    default:
                        interruptResult = await OnConfusedAsync(dc).ConfigureAwait(false);
                        break;
                }
            }
        }

        protected override async Task CompleteAsync(DialogContext innerDc, CancellationToken cancellationToken = default(CancellationToken))
        {
            // The active dialog's stack ended with a complete status
            await innerDc.Context.SendActivityAsync("Anything else I can help with?\rTry typing `help` or `hello`.");
        }

        // Handle help requests for the main/root level.
        protected virtual async Task<InterruptionStatus> OnMainHelpAsync(DialogContext dc)
        {
            if (dc.ActiveDialog != null)
            {
                await dc.CancelAllDialogsAsync();
            }

            await dc.Context.SendActivityAsync("Welcome to the Basic Bot.");
            await dc.Context.SendActivityAsync("I understand greetings, being asked for help, or being asked to cancel what I am doing.");

            // Signal the conversation was interrupted and should immediately continue
            return InterruptionStatus.Interrupted;
        }

        /// <summary>
        /// Handle help requests.
        /// </summary>
        /// <param name="dc">The current <see cref="DialogContext"/>.</param>
        /// <returns>A <see cref="Task"/> representing the <see cref="InterruptionStatus"/>.</returns>
        protected virtual async Task<InterruptionStatus> OnConfusedAsync(DialogContext dc)
        {
            await dc.Context.SendActivityAsync("Didn't quite understand that.");
            await dc.Context.SendActivityAsync("I understand greetings, or being asked for help.\nTry typing `help` or `hello`.");

            // Signal the conversation was interrupted and should immediately continue
            return InterruptionStatus.Interrupted;
        }

        // Create an attachment message response.
        private Activity CreateResponse(Activity activity, Attachment attachment)
        {
            var response = activity.CreateReply();
            response.Attachments = new List<Attachment>() { attachment };
            return response;
        }

        // Load attachment from file
        private Attachment CreateAdaptiveCardAttachment()
        {
            var adaptiveCard = File.ReadAllText(@".\Dialogs\Welcome\Resources\welcomeCard.json");
            return new Attachment()
            {
                ContentType = "application/vnd.microsoft.card.adaptive",
                Content = JsonConvert.DeserializeObject(adaptiveCard),
            };
        }
    }
}
