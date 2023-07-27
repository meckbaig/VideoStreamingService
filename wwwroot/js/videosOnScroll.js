window.onload = () =>{
    checkPosition();
};

function refreshPages(){
    nextPage = 2;
    preventLoading = false;
    checkPosition();
}
function refreshPagesFrom(page){
    nextPage = page;
    preventLoading = false;
    checkPosition();
}

let nextPage = 2;
let preventLoading = false;
if (FeedType === undefined)
    var FeedType = '';
if (SearchString === undefined)
    var SearchString = '';
if (DaysTake === undefined)
    var DaysTake = 1;
if (DaysSkip === undefined)
    var DaysSkip = 0;
if (UrlsArr === undefined)
    var UrlsArr = '';
if (VisibilitiesArr === undefined)
    var VisibilitiesArr = '';
if (ContainerId === undefined)
    var ContainerId = "videosContainer"
if (MaxVideoPages === undefined)
    var MaxVideoPages = 10;
if (ChannelUrl === undefined)
    var ChannelUrl = '';

;(() => {
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);
})();
function checkPosition() {
    const height = document.body.offsetHeight
    const screenHeight = window.innerHeight
    const scrolled = window.scrollY
    const threshold = height - screenHeight / 4
    const position = scrolled + screenHeight

    if (!preventLoading && position >= threshold) {
        preventLoading = true;
        $.ajax({
            url: "/Home/LoadVideos",
            type: "POST",
            data: JSON.stringify({
                feedType: FeedType, 
                nextPage,
                searchString: SearchString,
                daysTake: DaysTake,
                daysSkip: DaysSkip,
                urlsArr: UrlsArr,
                visibilitiesArr: VisibilitiesArr,
                channelUrl: ChannelUrl
            }),
            cache: false,
            contentType: "application/json",
            processData: false,
            success: function (loadedVideos) {
                nextPage++;
                $("#"+ContainerId).append(loadedVideos);
                if (loadedVideos!="\r\n" && nextPage <= MaxVideoPages){
                    preventLoading = false;
                    if (refreshPrevOver !== undefined)
                        refreshPrevOver();
                    if (UrlsArr != ''){
                        UrlsArr = [];
                        if (imgs !== undefined){
                            for (let i = 0; i < imgs.length; i++) {
                                if (imgs[i].classList.contains('preview')) {
                                    UrlsArr.push(imgs[i].id)
                                }
                            }
                        }
                    }
                }
                checkPosition()
            }
        });
    }
}