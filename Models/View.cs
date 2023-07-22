namespace VideoStreamingService.Models
{
    public class View
    {
        public string VideoUrl { get; set; }
        public Video Video { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int Watched { get; set; } = 0;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
