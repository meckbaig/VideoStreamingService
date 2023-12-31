using Microsoft.AspNetCore.Authentication.Cookies;

using Microsoft.EntityFrameworkCore;
using VideoStreamingService.Data;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using Xabe.FFmpeg;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// SQL=>C# � �������
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddMemoryCache();
builder.Services.AddAuthentication(
    CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(option => option.LoginPath = "/User/GoogleLogin")
    .AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });
builder.Services.AddAuthorization();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVideoService, VideoService>();
builder.Services.AddScoped<IVideoProcessingService, VideoProcessingService>();
builder.Services.AddScoped<IUpdateDataService, UpdateDataService>();
builder.Services.AddTransient<IAppConfig, AppConfig>();
builder.Services.AddTransient<IWalletsConfig, AppConfig>();
builder.Services.AddTransient<IPaymentService, PaymentService>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

FFmpeg.SetExecutablesPath(Path.Combine(builder.Environment.WebRootPath, "ffmpeg"), ffmpegExeutableName: "ffmpeg");

var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days.
    // You may want to change this for production
    // scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseSession(); 
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}");
app.MapControllerRoute(name: "channel_route",
                           pattern: "{controller=Channel}/{action=Index}/{id?}");
app.UseAuthentication();
app.UseAuthorization();
app.Run();