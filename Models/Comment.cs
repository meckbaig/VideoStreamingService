using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VideoStreamingService.Models
{
	public class Comment
	{
		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public long Id { get; set; }

		public string VideoUrl { get; set; }
		public Video Video { get; set; }

		public int UserId { get; set; }
		public User User { get; set; }

		public DateTime Date { get; set; } = DateTime.Now;
		public string Message { get; set; }
	}
}
