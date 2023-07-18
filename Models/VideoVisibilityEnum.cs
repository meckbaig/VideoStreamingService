using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace VideoStreamingService.Models
{
    public enum VideoVisibilityEnum
    {
		[Display(Name = "Открытый доступ")]
		Visible = 1,
		[Display(Name = "Доступ по ссылке")]
		LinkAccess = 2,
		//[Display(Name = "Ограниченный доступ")]
		//LimitedAccess = 3,
		[Display(Name = "Закрытый доступ")]
		Hidden = 4,
		//[Display(Name = "Временно не доступно")]
		//TemporarilyUnavailable = 5
	}
}
