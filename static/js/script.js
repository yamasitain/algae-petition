/* Author: @ibagrak */

$(document).ready( function() {
    // remove ugly IE shadow around links / tabs
    // setup validation to play well with default Twitter bootstrap classes
    /* 
    Email authentication popups and forms
    */

    // modal popup can be in 2 states: hidden or shown
    // when shown: it can be in 3 states: 
    // 1. start state - form shown and validating input, button active
    // 2. submitting state - form deactivated, button deactivated (ajax request sent)
    // 3. submitted state - form deactivated, button deactivated, result message shown (ajax response received)
    // 
    //      if submitted state result is error we can (1) close modal or (2) restore to state 1.
    //      if submitted state result is success we can (1) close modal
    
    $('.tri-state').each(function () {
        var modal = $(this);
        var frm = $(this).find('form');
        var btn = $(this).find('button[type=submit]');
        var orig_btn_label = btn.html();
        var result = $(this).find('.form_result');
        var action = frm.attr('name');
        
        // restore state when modal is hidden
        modal.on('hidden', function () {    
            var result = $(this).find('.form_result');
                  
            frm.find(':input').removeAttr('disabled');
            frm.find(':input').val('');
            frm.validate().resetForm(); // reset validation state
            
            btn.removeClass('restore').addClass('submit');
            btn.html(orig_btn_label);
            btn.removeAttr('disabled');
            
            result.hide(); 
            frm.show();
            btn.show();
        });
          
        // submit button callback
        btn.click(function(e) {
            // restore form after error message
            if (btn.hasClass('restore')) {
                btn.removeClass('restore');
                btn.appendTo(btn.parents().find('.btn_container'));
                
                // enable form  
                frm.find(':input').removeAttr('disabled');
                frm.find(':input').val('');
                frm.validate().resetForm();
                        
                result.hide(); 
                frm.show();
                $(this).html(orig_btn_label)
            // submit button normally
            } else {
                var kvs = {}
                var invalid_fields = false;

                frm.find(":input").each(function() {

                    if ($(this).attr('type') == 'password') {
                        kvs[$(this).attr('id')] = MD5($(this).val());
                    } else {
                        kvs[$(this).attr('id')] = $(this).val();
                    }
                });
                
                if (invalid_fields) 
                    return false;

                // Disable form
                frm.find(':input').attr('disabled', '');
                
                // Disable button
                btn.attr('disabled', '');
                btn.html('Sending...');
                
                $.ajax({
                    type: 'GET',
                    url: '/' + action,
                    data: kvs,
                }).done(function(data, code, jqxhr) {
                    var code = data['code'];
                    var message = data['message'];
                    
                    if (code == 200) { // success
                        // if we were trying to signin reload with new session on success
                        if (action == 'email-signin') {
                            location.reload();
                        } else {
                            // hide form & show result
                            result.html('Success!');
                            frm.hide();
                            result.show();
                            
                            btn.hide();
                        }
                    } else {
                        // should never happen (HTTP error code always matches JSON 'code')
                    }
                }).fail(function(jqxhr, code, exception) {
                    // TODO: Error handling
                    var data = $.parseJSON(jqxhr.responseText);
                    var code = data['code'];
                    var message = data['message'];
                    
                    result.html('So sorry! ' + message);
                    frm.hide();
                    result.show();  
                    
                    btn.removeAttr('disabled');
                    btn.html('Try again');
                    btn.addClass('restore');

                    btn.appendTo(btn.parents('.modal-footer'));
                }); 
            }  
        });
    });
