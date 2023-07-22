namespace VideoStreamingService.Models
{
	public class Reaction
	{
		public string VideoUrl { get; set; }
		public Video Video { get; set; }

		public int UserId { get; set; }
		public User User { get; set; }

		public bool Like { get; set; }
		public DateTime Date { get; set; } 
	}
}
