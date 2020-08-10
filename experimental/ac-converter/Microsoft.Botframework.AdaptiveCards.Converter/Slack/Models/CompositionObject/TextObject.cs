﻿using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace Microsoft.Botframework.AdaptiveCards.Converter.Slack.Models
{
    public class TextObject
    {
        public string type { get; set; }
        public string text { get; set; }
        public bool? emoji { get; set; }
        public bool? verbatim { get; set; }
        public JObject properties { get; set; }
    }
}
