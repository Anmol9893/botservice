﻿using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace Microsoft.Botframework.AdaptiveCards.Converter.Slack.Models
{
    public class ConfirmObject
    {
        public TextObject title { get; set; }
        public TextObject text { get; set; }
        public TextObject confirm { get; set; }
        public TextObject deny { get; set; }
        public string style { get; set; }
        public JObject properties { get; set; }
    }
}
