class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="menu-lateral" id="expandir">
                

                <ul id="expandir">

                <div class="logo">
                    <img src="/assets/images/BeboSim.png" alt="Logo">
                </div>
                    <li class="item-menu">
                    
                        <a href="/assets/index.html">
                            <span class="icon">
                                <i class="bi bi-house-door-fill"></i>
                            </span>
                            <span class="txt-link">Início</span>

                        </a>
                    </li>

                    <li class="item-menu submenu-container">
                        <a href="#" class="menu-toggle">
                            <span class="icon"><i class="bi bi-pencil-square"></i></span>
                            <span class="txt-link">Funcionários</span>
                        </a>
                        <ul class="submenu">
                            <li><a href="/assets/pages/tutores/cadastrar.html">Cadastrar</a></li>
                            <li><a href="/assets/pages/tutores/buscar.html">Buscar</a></li>
                            <li><a href="/assets/pages/tutores/editar.html">Editar</a></li>
                        </ul>
                    </li>

                    <li class="item-menu submenu-container">
                        <a href="#" class="menu-toggle">
                            <span class="icon"><i class="bi bi-pencil-square"></i></span>
                            <span class="txt-link">Animais</span>
                        </a>
                        <ul class="submenu">
                            <li><a href="/assets/pages/animais/cadastrar.html">Cadastrar</a></li>
                            <li><a href="/assets/pages/animais/buscar.html">Buscar</a></li>
                            <li><a href="/assets/pages/animais/editar.html">Editar</a></li>
                        </ul>
                    </li>
                    <li class="item-menu submenu-container">
                        <a href="#" class="menu-toggle">
                            <span class="icon"><i class="bi bi-pencil-square"></i></span>
                            <span class="txt-link">Veterinário</span>
                        </a>
                        <ul class="submenu">
                            <li><a href="/assets/pages/veterinario/cadastrar.html">Cadastrar</a></li>
                            <li><a href="/assets/pages/veterinario/buscar.html">Buscar</a></li>
                            <li><a href="/assets/pages/veterinario/editar.html">Editar</a></li>
                        </ul>
                    </li>
                    <li class="item-menu submenu-container">
                        <a href="#" class="menu-toggle">
                            <span class="icon">
                                <i class="bi bi-clipboard-heart-fill"></i>
                            </span>
                            <span class="txt-link">Atendimento</span>
                        </a>
                        <ul class="submenu">
                            <li><a href="/assets/pages/atendimento/cadastrar.html">Cadastrar</a></li>
                            <li><a href="/assets/pages/atendimento/buscar.html">Buscar</a></li>
                            <li><a href="/assets/pages/atendimento/editar.html">Editar</a></li>
                        </ul>
                    </li>
                    <li class="item-menu submenu-container">
                        <a href="#">
                            <span class="icon">
                                <i class="bi bi-calendar-check-fill"></i>
                            </span>
                            <span class="txt-link">Agendamento</span>
                        </a>
                        <ul class="submenu">
                            <li><a href="/assets/pages/agendamento/cadastrar.html">Cadastrar</a></li>
                            <li><a href="/assets/pages/agendamento/buscar.html">Buscar</a></li>
                            <li><a href="/assets/pages/agendamento/editar.html">Editar</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>

    `;
    }
}

customElements.define('main-header', Header);