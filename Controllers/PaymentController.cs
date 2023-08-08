using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.WebEncoders.Testing;
using VideoStreamingService.Data;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Controllers;

public class PaymentController : Controller
{
    private readonly IPaymentService _payment;
    private readonly ISession _session;
    private readonly IWalletsConfig _wallets;
    
    public PaymentController(IPaymentService payment, IHttpContextAccessor accessor,
        IWalletsConfig wallets)
    {
        _payment = payment;
        _session = accessor.HttpContext.Session;
        _wallets = wallets;
    }
    [HttpPost]
    public IActionResult GetPaymentHtml(string url)
    { 
        using(WebClient client = new WebClient()) {
            return Content(client.DownloadString(url), "text/html");
        }
    }

    [AcceptVerbs("Get", "Post")]
    public IActionResult CheckYoomoneyId(string yoomoneyId)
    {
        string html;
        string url = _wallets.DefaultYoomoneyUrl + yoomoneyId;
        using(WebClient client = new WebClient()) {
            html = client.DownloadString(url);
        }
        int i1 = html.IndexOf("<div id=\"root\">");
        int i2 = html.IndexOf("<div id=\"footer\">");
        string subHtml = html.Substring(i1, i2-i1);
        if (subHtml.Contains(yoomoneyId) && !subHtml.Contains("Перевести не получится"))
            return Json(true);
        return Json(false);
    }
    
    [HttpGet]
    public async Task<IActionResult> Edit()
    {
        int? userId = _session.Get<User>("CurUser")?.Id;
        if (userId == null) 
            return View("Edit", await _payment.GetWallet(User.Identity.Name));
        else
            return View("Edit", await _payment.GetWallet((int)userId));
    }
    
    [HttpPost]
    public async Task<IActionResult> Edit(Wallet wallet)
    {
        if (!ModelState.IsValid) 
            return View(wallet);
        if (!(await _payment.SetWallet(wallet, _session.Get<User>("CurUser").Id)))
            return View(wallet);
        return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
    }
}