function editComment(commentId) {
    let commentArea = document.getElementById('commentArea_' + commentId);
    commentArea.disabled = !commentArea.disabled;
	$(commentArea).toggleClass("border-0 border-1 p-0");
	if (commentArea.getAttribute("past-value") == null) {
		commentArea.setAttribute("past-value", commentArea.value)
	}
	else {
		commentArea.value = commentArea.getAttribute("past-value");
		commentArea.removeAttribute("past-value");
	}

    let saveCommentButton = document.getElementById('saveComment_' + commentId);
	saveCommentButton.disabled = !saveCommentButton.disabled;
	$(saveCommentButton).toggleClass("opacity-0");
}

function deleteComment(commentId) {
	let comment = document.getElementById('comment_' + commentId);
	comment.parentElement.removeChild(comment);
	updateComment(commentId, '');
}

function saveComment(commentId) {
	let commentArea = document.getElementById('commentArea_' + commentId);
	commentArea.disabled = true;
	$(commentArea).toggleClass("border-0 border-1 p-0");
	commentArea.removeAttribute("past-value");
	updateComment(commentId, commentArea.value);

	let saveCommentButton = document.getElementById('saveComment_' + commentId);
	saveCommentButton.disabled = true;
	$(saveCommentButton).toggleClass("opacity-0");
}

function updateComment(commentId, message) {
	$.ajax({
		type: "POST",
		url: '/Video/UpdateComment',
		data: JSON.stringify({
			commentId: commentId,
			message: message,
		}),
		cache: false,
		contentType: "application/json",
		processData: false
	});
} 