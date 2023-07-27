namespace VideoStreamingService.Data.ViewModels
{
    public interface ISearchElement
    {
        string Url { get; set; }
        float? SorensenDiceCoefficient { get; set; }
        long? MaxResults { get; }
    }
}