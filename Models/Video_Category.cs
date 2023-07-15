namespace VideoStreamingService.Models
{
	public class Video_Category
	{
		public string VideoId { get; set; }
		public Video Video { get; set; }

		public int CategoryId { get; set; }
		public Category Category { get; set; }
	}
}
