using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class EditUserVM : BasicClass
    {
        public int Id { get; set; }

        [Display(Name = "Идентификатор")]
        [Required(ErrorMessage = "Не указан идентификатор")]
        [StringLength(40, MinimumLength = 5, 
            ErrorMessage = "Длина строки должна быть от 5 до 40 символов")]
        [Remote(action: "CheckUrl", controller: "User", 
            ErrorMessage = "Данный идентификатор занят другим пользователем")]
		[RegularExpression(@"^[a-zA-Z0-9_-]{5,40}$",
		    ErrorMessage = "Используйте латиницу, числа, символы тире и нижнего подчёркивания ")]
		public string Url { get; set; }

        [Display(Name = "Имя пользователя")]
        [Required(ErrorMessage = "Не указано имя пользователя")]
        [StringLength(40, MinimumLength = 3, 
            ErrorMessage = "Длина строки должна быть от 3 до 40 символов")]
        public string Name { get; set; }

        //[Display(Name = "Пароль")]
        //[Required(ErrorMessage = "Не указан пароль")]
        //[DataType(DataType.Password)]
        //public string Password { get; set; }

        //[Display(Name = "Подтверждение пароля")]
        //[Required(ErrorMessage = "Подтвердите пароль")]
        //[DataType(DataType.Password)]
        //[Compare("Password", ErrorMessage = "Пароль не совпадает")]
        //public string ConfirmPassword { get; set; }
        public string? Image { get; set; } // сделать....

        public EditUserVM(User user)
        {
            Id = user.Id;
            Url = user.Url;
            Name = user.Name;
            Image = user.Image;
        }
        public EditUserVM()
        {

        }
    }
}
