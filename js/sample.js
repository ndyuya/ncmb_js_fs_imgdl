$(document).ready(function(){
    var APP_KEY = "YOUR_APP_KEY";
    var CLIENT_KEY = "YOUR_CLIENT_KEY";

    NCMB.initialize(APP_KEY, CLIENT_KEY);

    var download_image = function() {
        var route = "files";
        var className = $("#file_name").val();
        var objectId = null;
        var method = "GET";
        var api_version = "2013-09-01"
        var url = "https://mb.api.cloud.nifty.com/" + api_version + "/" + route + "/" + className;

        if (!className || className == "") {
            alert("ファイル名を指定してください");
            return;
        }

        // タイムスタンプの生成
        var now = new Date();
        var timestring = now.toISOString();
        while (timestring.indexOf(":") > -1) {
            timestring = timestring.replace(":","%3A");
        }
        var timestamp = timestring;

        // シグネチャの計算
        var signature = NCMB._createSignature(route, className, objectId, url, method, timestamp);

        // リクエストの実行
        var request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.overrideMimeType('text/plain; charset=x-user-defined');
        request.setRequestHeader("X-NCMB-Application-Key", APP_KEY);
        request.setRequestHeader("X-NCMB-Timestamp", timestamp);
        request.setRequestHeader("X-NCMB-Signature", signature);
        request.send(null);

        if (request.status != 200) {
            alert("取得に失敗しました");
            return;
        }

        var response = request.responseText;

        // 画像のバイナリを文字列に変換
        var s_response = '';
        for (i = 0; i < response.length; i++){
            s_response += String.fromCharCode(response.charCodeAt(i) & 0xff);
        }

        // 画像形式の推定
        var header = s_response.substring(0,9);
        var type;
        if (header.match(/^\x89PNG/)) {
            type = 'png';
        } else if (header.match(/^BM/)){
            type = 'bmp';
        } else if (header.match(/^GIF87a/) || header.match(/^GIF89a/)) {
            type = 'gif';
        } else if (header.match(/^\xff\xd8/)) {
            type = 'jpeg';
        } else {
            alert("画像ファイルの形式が特定できないため中断しました");
            return;
        }

        // base64変換してimgタグに直書き込み
        var data = 'data:image/' + type + ';base64,' + window.btoa(s_response);
        var image_canvas = document.getElementById("image_canvas");
        image_canvas.src = data;
    };

    $("#download").bind("click", download_image);
});
