using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VideoStreamingService.Data.ViewModels
{
    public interface ISearchElement
    {
        string Url { get; set; }
        double? DiceCoefficient { get; set; }
        long? MaxResults { get; }
    }
}