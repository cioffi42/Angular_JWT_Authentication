/**
 * Created by Chris on 6/24/2019.
 */

function addBand() {
    var myForm = document.getElementById('loginForm');
    var formData = new FormData(myForm);

    var user = {
        "username": formData.get('username'),
        "password": formData.get('password')
    };
    console.log(user);
    $.ajax({
        url: '/login',
        type: 'POST',
        data: {
            "username": formData.get('username'),
            "password": formData.get('password')
        },
        success: function (res) {
            //store token in http cookie
            console.log(`success! response body: ${res}`);
        }
    });
}
