using System.ComponentModel.DataAnnotations;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data;
using Microsoft.AspNetCore.Mvc;
    
namespace VideoStreamingService.Models
{
	public class User : BasicClass, IEntityBase
    {
		[Key]
		public int Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }

        // [Remote(action: "CheckEmail", controller: "Home", ErrorMessage = "Email уже используется")] // полезное, можно заюзать
        public string Email { get; set; }   
        public string Password { get; set; }
        public bool EmailConfirmed { get; set; } = false;
        public bool WideVideo { get; set; } = false;
        public string Theme { get; set; } = "light";
        public string? Image { get; set; } 
        public int RoleId { get; set; } = (int)RoleEnum.RegularUser;


        public Role Role { get; set; } = new Role();
		public List<Video> Videos { get; set; } = new List<Video>();
        public List<Reaction> Reactions { get; set; } = new List<Reaction>();
        public List<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public List<Subscription> Subscribers { get; set; } = new List<Subscription>();
        public List<View> Views { get; set; } = new List<View>();
    }
}
