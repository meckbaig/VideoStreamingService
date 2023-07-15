namespace VideoStreamingService.Models
{
	public class Category
	{
		public int Id { get; set; }
		public string Name { get; set; }

		public List<Video_Category> Video_Categories { get; set;}
	}
}
