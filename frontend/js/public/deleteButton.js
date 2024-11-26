$("#delete-button").on('click', () => {
    $.ajax({
        url: window.location.pathname,
        type: 'DELETE',
        success: function(result) {
            window.location.href = '/';
        },
        error: function(xhr, status, error) {
            console.error('Error: ' + error);
        }
    });
});