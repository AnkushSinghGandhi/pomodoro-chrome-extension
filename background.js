
var theme_selector = document.getElementById('theme_toggler');

var theme_selected = theme_selector[0].value;

const theme_fun = () => {
    console.log('nishant');
    
    if(theme_selected === '2'){
        document.body.style.backgroundColor = '#fafafa';
    }
}

theme_selector.addEventListener('click', theme_fun);