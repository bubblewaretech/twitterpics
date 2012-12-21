JQTWEET = {

    // Set twitter hash/user, number of tweets & id/class to append tweets
    // You need to clear tweet-date.txt before toggle between hash and user
    hash: '%23puppy OR %23kitty', //leave this blank if you want to show user's tweet
    user: '',
    numTweets: 100,
    numPages: 25,
    cacheExpiry: 1, //get the new cache in hours
    appendTo: '#jstwitter',

    // core function of jqtweet
    //https://dev.twitter.com/docs/using-search
    loadTweets: function (pagenumber) {

        var request;

        // different JSON request {hash|user}
        if (JQTWEET.hash) {
            request = {
                q: JQTWEET.hash,
                rpp: JQTWEET.numTweets,
                include_entities: true,
                expiry: JQTWEET.cacheExpiry,
                page: pagenumber,
                api: 'http://search.twitter.com/search.json'
            }
        } else {
            request = {
                screen_name: JQTWEET.user,
                include_rts: true,
                count: JQTWEET.numTweets,
                include_entities: true,
                expiry: JQTWEET.cacheExpiry,
                api: 'http://api.twitter.com/1/statuses/user_timeline.json/'
            }
        }

        $.ajax({
            url: 'tweets-grab.php',
            type: 'GET',
            dataType: 'json',
            data: request,
            success: function (data, textStatus, xhr) {

                var text, name, html = '<div class="tweet"><span class="text">IMG_TAG TWEET_TEXT</span></br><span class="time"><a href="URL" target="_blank">AGO</a></span></div>';

                try {

                    //Twitter Search API has different JSON Structure
                    if (JQTWEET.hash) data = data['results'];
                    var img;
                    // append tweets into page
                    for (var i = 0; i < data.length && i < JQTWEET.numTweets; i++) {

                        name = (JQTWEET.hash) ? data[i].from_user : data[i].user.screen_name;

                        try {

                            if (data[i].entities.media) {
                                img = '<a href="' + data[i].entities.media[0].media_url + ':large" class="fancy">';
                                img += '<img src="' + data[i].entities.media[0].media_url + ':thumb" alt="" width="150" />';
                                img += '</a>';

                                $(JQTWEET.appendTo).append(
						        html.replace('IMG_TAG', img)
                                    .replace('TWEET_TEXT', JQTWEET.ify.clean(data[i].text))
						            .replace('AGO', JQTWEET.timeAgo(data[i].created_at))
						            .replace('URL', 'http://twitter.com/' + data[i].from_user + '/status/' + data[i].id_str)
						        );
                            } else {
                                img = '';
                            }

                        } catch (e) {
                            console.log('Error ' + e.ToString);
                        }

                    }

                    //the last step, activate fancybox 
                    $("a.fancy").fancybox({
                        'overlayShow': false,
                        'transitionIn': 'elastic',
                        'transitionOut': 'elastic',
                        'overlayShow': true
                    });
                } catch (e) {
                    console.log('Error ' + e.ToString);
                }

            }

        });

    },
    
    loadMasonryInfiniteOLD: function(){

                    //trigger jQuery Masonry once all data are loaded				
                    var $container = $('#jstwitter');
                    $container.imagesLoaded(function () {
                        $container.masonry({
                            itemSelector: '.tweet',
                            isAnimated: true,
                            appended: '.tweet',
                            // set columnWidth a fraction of the container width
                              columnWidth: function( containerWidth ) {
                                return containerWidth / 5;
                              }
                        });
                    });

                    //load infinite scroll
                    $container.infinitescroll(
                    {
                        navSelector: ".pagination",
                        nextSelector: ".next",
                        itemSelector: ".tweet",
                        loading: {
                            finishedMsg: "",
                            img: "/resources/imageloader.gif",
                            msg: null,
                            msgText: ""
                        }
                    }
                 
                    );               
    },

    loadMasonryInfinite: function(){

        var $container = $('#jstwitter');

        $container.imagesLoaded(function(){
          $container.masonry({
            itemSelector: '.tweet',
            columnWidth: function( containerWidth ) {
                                return containerWidth / 5;
                              },
            isAnimated: true
          });
        });

        $container.infinitescroll({
          navSelector  : '#page-nav',    // selector for the paged navigation
          nextSelector : '#page-nav a',  // selector for the NEXT link (to page 2)
          itemSelector : '.twitter',     // selector for all items you'll retrieve
          loading: {
              finishedMsg: 'No more pages to load.',
              img: '/resources/imageloader.gif'
            }
          },
          // trigger Masonry as a callback
          function( newElements ) {
            // hide new items while they are loading
            var $newElems = $( newElements ).css({ opacity: 0 });
            // ensure that images load before adding to masonry layout
            $newElems.imagesLoaded(function(){
              // show elems now they're ready
              $newElems.animate({ opacity: 1 });
              $container.masonry( 'appended', $newElems, true );
            });
          }
        );
    },

    /**
    * relative time calculator FROM TWITTER
    * @param {string} twitter date string returned from Twitter API
    * @return {string} relative time like "2 minutes ago"
    */
    timeAgo: function (dateString) {
        var rightNow = new Date();
        var then = new Date(dateString);

        if ($.browser.msie) {
            // IE can't parse these crazy Ruby dates
            then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
        }

        var diff = rightNow - then;

        var second = 1000,
		minute = second * 60,
		hour = minute * 60,
		day = hour * 24,
		week = day * 7;

        if (isNaN(diff) || diff < 0) {
            return ""; // return blank string if unknown
        }

        if (diff < second * 2) {
            // within 2 seconds
            return "right now";
        }

        if (diff < minute) {
            return Math.floor(diff / second) + " seconds ago";
        }

        if (diff < minute * 2) {
            return "about 1 minute ago";
        }

        if (diff < hour) {
            return Math.floor(diff / minute) + " minutes ago";
        }

        if (diff < hour * 2) {
            return "about 1 hour ago";
        }

        if (diff < day) {
            return Math.floor(diff / hour) + " hours ago";
        }

        if (diff > day && diff < day * 2) {
            return "yesterday";
        }

        if (diff < day * 365) {
            return Math.floor(diff / day) + " days ago";
        }

        else {
            return "over a year ago";
        }
    }, // timeAgo()


    /**
    * The Twitalinkahashifyer!
    * http://www.dustindiaz.com/basement/ify.html
    * Eg:
    * ify.clean('your tweet text');
    */
    ify: {
        link: function (tweet, hasIMG) {
            return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function (link, m1, m2, m3, m4) {
                var http = m2.match(/w/) ? 'http://' : '';
                if (hasIMG) return '';
                else return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
            });
        },
        link: function (tweet) {
            return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function (link, m1, m2, m3, m4) {
                var http = m2.match(/w/) ? 'http://' : '';
                return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
            });
        },

        at: function (tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function (m, username) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
            });
        },

        list: function (tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function (m, userlist) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
            });
        },

        hash: function (tweet) {
            return tweet.replace(/(^|\s+)#(\w+)/gi, function (m, before, hash) {
                return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
            });
        },

        clean: function (tweet, hasIMG) {
            return this.hash(this.at(this.list(this.link(tweet, hasIMG))));

        }
    } // ify


};



$(document).ready(function () {
    // start jqtweet!
    for (var i = 1; i < JQTWEET.numPages; i++) {
        JQTWEET.loadTweets(i);
    }
    JQTWEET.loadMasonryInfinite();

    
});
