var _languageSelection = false
var _language

LW.pages.forum.init = function(params, $scope, $page) {

	_language = 'forum/language' in localStorage ? localStorage['forum/language'] : _.lang.current

	_.get('forum/get-categories/' + _language + '/' + LW.token(), function(data) {

		$scope.categories = data.categories
		$page.render()

		LW.setTitle(_.lang.get('forum', 'title'))
		LW.setMenuTab('forum')

		_.get('farmer/get-connected', function(data) {

			$('#connected-farmers').html(_.view.render('forum.connected_farmers', {
				farmers: data.farmers
			}))

			$('#connected-farmers-title').text(_.lang.get('forum', 'connected_farmers', _.format.number(data.count)))
		})

		$page.chat = new ChatController($('#chat .content'))

		// Expand connected farmers
		$('#expand-connected-farmers').click(function() {
			var expanded = $('#connected-farmers').hasClass('expanded');
			if (!expanded) {
				$('#connected-farmers').addClass('expanded');
				$(this).attr('src', LW.staticURL + 'image/collapse.png');
			} else {
				$('#connected-farmers').removeClass('expanded');
				$(this).attr('src', LW.staticURL + 'image/expand.png');
			}
		});

		// Recherche
		$('#search-box #query').keyup(function(e) {
			if (e.keyCode == 13) {
				search()
			}
		})
		$('#search-box img').click(function() {
			search()
		})

		// Forum language
		$('#forum-language img.flag').attr('src', LW.staticURL + _.lang.languages[_language].flag)

		$('#tt_forum-language .lang').click(function() {

			localStorage['forum/language'] = $(this).attr('lang')
			LW.page('/forum')
		})
	})
}

LW.pages.forum.wsconnected = function() {

	$('#chat .websocket-loader').remove()
}

LW.pages.forum.wsreceive = function(data) {

	if (!this.chat) return ;

	if (data.type == FORUM_CHAT_RECEIVE) {
		data = data.data
		var message = {
			lang: data[0],
			farmer_id: data[1],
			farmer_name: data[2],
			content: data[3],
			date: data[4],
			farmer_color: data[5],
			avatar_changed: data[6]
		}
		this.chat.receive_message(message)
	} else if (data.type == CHAT_MUTE_USER) {
		this.chat.mute_user(data.data)
	}
}

function search() {

	var query = $('#query').val().replace(' ', '+');
	LW.page('/search/' + query)
}
