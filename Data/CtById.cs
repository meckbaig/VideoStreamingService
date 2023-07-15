namespace VideoStreamingService.Data
{
    public class CtById
    {
        public string Id { get; set; }
        public CancellationTokenSource Cts { get; set; }

        public CtById(string id, CancellationTokenSource cts)
        {
            Id = id;
            Cts = cts;
        }
    }
}
