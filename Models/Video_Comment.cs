namespace VideoStreamingService.Models
{
	public class Video_Comment
	{
		public long CommentId { get; set; }
		public Comment Comment { get; set; }
		public string VideoUrl { get; set; }
		public Video Video { get; set; }
	}
}
