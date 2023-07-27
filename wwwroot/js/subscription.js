window.onload = () => {
	buttons = document.getElementsByTagName("button");
	for (let i = 0; i < buttons.length; i++) {
		if (buttons[i].classList.contains('sub-btn')) {
			buttons[i].onclick = changeSubscription;
			if (buttons[i].getAttribute('subed') == 'true') {
				subButtonToggle(buttons[i]);
			}
		}
	}
}

function changeSubscription(event) {
	var target = event.currentTarget;
	var subUrl = "/Subscribe/" + target.getAttribute("channelUrl") + "_" + target.getAttribute("subed");
	$.ajax({
		type: 'POST',
		url: subUrl,
		contentType: false,
		processData: false,
		success: function (subsCount) {
			if (subsCount < 1000) {
				var subCount = document.getElementById('subCount_' + target.getAttribute("channelUrl"));
				subCount.textContent = subsCount + subsString(subsCount);
			}

		}
	});
	target.setAttribute("subed", target.getAttribute("subed") != 'true');
	subButtonToggle(target);
};

function subsString(subsCount) {
	switch (subsCount % 10) {
		case 1: return " подписчик";
		case 2:
		case 3:
		case 4:
			return " подписчика";
		default: return " подписчиков"
	};
};	

function toggleLoad(event, subed) {
	var target = event.currentTarget;
	if (subed == 'true') {
		subButtonToggle(target);
	}
}

function subButtonToggle(target) {
	target.classList.toggle("btn-success");
	target.classList.toggle("btn-outline-secondary");
	if (target.getAttribute("subed") == 'true') {
		target.textContent = 'Подписка оформлена';
	}
	else {
		target.textContent = 'Подписаться';
	}
	buttonHover(target);
}

function buttonHover(target) {
	if (target == null)
		target = target.currentTarget;
	if (target.getAttribute("subed") == 'true') {
		target.onmouseover = () => {
			target.textContent = 'Отписаться';
		}
		target.onmouseout = () => {
			target.textContent = 'Подписка оформлена';
		}
	}
	else {
		target.onmouseout = null;
		target.onmouseover = null;
	}
}