using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using VideoStreamingService.Data;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data.ViewModels;

namespace VideoStreamingService.Models
{
	public class Video : BasicClass, IEntityBase
    {
		[Key]
		public string Url { get; set; }
		public string Title { get; set; }
		public string? Description { get; set; }
		public string Thumbnail { get; set; } = "1";
		public DateTime Uploaded { get; set; } = DateTime.Now;
		public short Resolution { get; set; }
		public short Length { get; set; }


		public int UserId { get; set; }
		[ForeignKey("UserId")]
		public User User { get; set; }
		public int VisibilityId { get; set; } = (int)VideoVisibilityEnum.Hidden;
		[ForeignKey("VisibilityId")]
		public VideoVisibility Visibility { get; set; }
		
		public List<Reaction> Reactions { get; set; } = new List<Reaction>(); 
		public List<View> Views { get; set; } = new List<View>();
		public List<Video_Category> Video_Categories { get; set; } = new List<Video_Category>();
	}
}
