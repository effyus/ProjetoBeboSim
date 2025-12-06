var menuItem = document.querySelectorAll('.item-menu')

function selectLink(){
    menuItem.forEach((item)=>
        item.classList.remove('ativo')
    ) 
    this.classList.add('ativo')
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleMenus = document.querySelectorAll('.menu-toggle');
    toggleMenus.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = toggle.nextElementSibling;
            submenu.style.display = submenu.style.display === 'flex' ;
        });
    });
});

//expandir menu
