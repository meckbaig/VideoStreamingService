﻿using System.ComponentModel.DataAnnotations;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data;

namespace VideoStreamingService.Models
{
	public class User : BasicClass, IEntityBase
    {
		[Key]
		public int Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public bool EmailConfirmed { get; set; } = false;
        public bool WideVideo { get; set; } = false;
        public string Theme { get; set; } = "light";
        public string? Image { get; set; } // сделать....
        public int RoleId { get; set; } = 1;


        public Role Role { get; set; } = new Role();
		public List<Video> Videos { get; set; } = new List<Video>();
        public List<Reaction> Reactions { get; set; } = new List<Reaction>();
        public List<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public List<Subscription> Subscribers { get; set; } = new List<Subscription>();
        public List<View> Views { get; set; } = new List<View>();
    }
}