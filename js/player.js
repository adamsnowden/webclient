(function () {
    var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];

    function PlayerHolder() {
        $.observable(this);

        this.players = {};
        this.names = {};

        this.friends = [];
    }

    PlayerHolder.prototype.login = function(id, info) {
        var obj = {};

        obj[id] = info;
        this.addPlayer(obj);

        this.trigger("login", id, info);
    };

    PlayerHolder.prototype.hasPlayer = function(pid) {
        return pid in this.players;
    };

    PlayerHolder.prototype.addPlayer = function (players) {
        var activeChannel = webclient.currentChannel(),
            playerObj,
            player, name,
            id, x;

        for (id in players) {
            player = players[id];
            name = player.name.toLowerCase();

            player.id = +id;
            playerObj = this.players[id];

            if (!playerObj) {
                this.players[id] = playerObj = player;
            } else {
                delete this.names[playerObj.name.toLowerCase()]; // Delete old names.

                /* Update only the new params */
                for (x in player) {
                    playerObj[x] = player[x];
                }
            }

            this.names[name] = playerObj;
            this.trigger("playeradd", playerObj, +id, name);
        }
    };

    PlayerHolder.prototype.addFriend = function(id) {
        if (this.friends.indexOf(id) !== -1) {
            return;
        }

        this.friends.push(id);
        if (id in this.players) {
            this.players[id].friend = true;
        }

        this.trigger("friendadd", id);
    };

    PlayerHolder.prototype.addIgnore = function(id) {
        if (id in this.ignores) {
            return;
        }

        this.ignores[id] = true;
        if (id in this.players) {
            this.players[id].ignored = true;
        }

        this.trigger("ignoreadd", id);
    };

    PlayerHolder.prototype.removeIgnore = function(id) {
        if (!(id in this.ignores)) {
            return;
        }

        delete this.ignores[id];
        if (id in this.players) {
            this.players[id].ignored = false;
        }

        this.trigger("ignoreremove", id);
    };

    PlayerHolder.prototype.isIgnored = function(id) {
        return id in this.players && this.players[id].ignored;
    };

    PlayerHolder.prototype.removePlayer = function (id) {
        var player = this.players[id],
            wasFriend = false;

        if (!player) {
            return;
        }

        if (this.friends.indexOf(id) !== -1) {
            this.friends.splice(this.friends.indexOf(id), 1);
            wasFriend = true;
        }

        this.trigger("playerremove", id, wasFriend);
        delete this.names[player.name.toLowerCase()];
        delete this.players[id];
    };

    PlayerHolder.prototype.player = function (pid) {
        var pidlc;

        if (pid in this.players) {
            return this.players[pid];
        } else if ((pidlc = (pid + "").toLowerCase()) in this.names) {
            return this.names[pidlc];
        }

        return null;
    };

    PlayerHolder.prototype.name = function(pid) {
        return ((pid in this.players) ? this.players[pid].name : "???");
    };

    PlayerHolder.prototype.auth = function(pid) {
        return ((pid in this.players) ? this.players[pid].auth : 0);
    };

    PlayerHolder.prototype.id = function (name) {
        var player = this.names[name.toLowerCase()],
            lname = name.toLowerCase();

        return (lname in this.names) ? this.names[lname].id : -1;
    };

    PlayerHolder.prototype.testPlayerOnline = function(player) {
        var i;

        if (this.friends.indexOf(player) !== -1) {
            return;
        }

        for (i in webclient.channels.channels) {
            if (player in webclient.channels.channel(i).players) {
                return;
            }
        }

        this.removePlayer(player);
    };

    PlayerHolder.prototype.color = function (id) {
        var player = this.player(id),
            color;

        if (!player) {
            return "#000000";
        }

        color = player.color;

        return color ? color : namecolorlist[id % namecolorlist.length];
    };

    webclient.classes.PlayerHolder = PlayerHolder;
}());