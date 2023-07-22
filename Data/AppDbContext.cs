using Microsoft.EntityFrameworkCore;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data
{
	public class AppDbContext:DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
		{

		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Reaction>().HasKey(r => new { r.UserId, r.VideoUrl });
            modelBuilder.Entity<Reaction>().HasOne(r => r.User).WithMany(u => u.Reactions).HasForeignKey(r => r.UserId);
			modelBuilder.Entity<Reaction>().HasOne(r => r.Video).WithMany(v => v.Reactions).HasForeignKey(r => r.VideoUrl);

			modelBuilder.Entity<Video_Category>().HasKey(vc => new { vc.CategoryId, vc.VideoUrl });
			modelBuilder.Entity<Video_Category>().HasOne(vc => vc.Category).WithMany(c => c.Video_Categories).HasForeignKey(vc => vc.CategoryId);
			modelBuilder.Entity<Video_Category>().HasOne(vc => vc.Video).WithMany(v => v.Video_Categories).HasForeignKey(vc => vc.VideoUrl);

			modelBuilder.Entity<View>().HasKey(v => new { v.UserId, v.VideoUrl });
            modelBuilder.Entity<View>().HasOne(v => v.User).WithMany(u => u.Views).HasForeignKey(v => v.UserId);
            modelBuilder.Entity<View>().HasOne(v => v.Video).WithMany(v => v.Views).HasForeignKey(v => v.VideoUrl);

            modelBuilder.Entity<Subscription>().HasKey(s => new { s.FromUserId, s.ToUserId });
            modelBuilder.Entity<Subscription>().HasOne(s => s.FromUser).WithMany(u => u.Subscriptions).HasForeignKey(s => s.FromUserId);
            modelBuilder.Entity<Subscription>().HasOne(s => s.ToUser).WithMany(u => u.Subscribers).HasForeignKey(s => s.ToUserId);

            base.OnModelCreating(modelBuilder);
		}


		public DbSet<User> Users { get; set; }
		public DbSet<Video> Videos { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Category> Categories { get; set; }
		public DbSet<Video_Category> Video_Categories { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<View> Views { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<VideoVisibility> VideoVisibility { get; set; }
    }
}
