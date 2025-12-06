async function carregarVeterinario() {
    try {
        const response = await fetch('/api/veterinario');
        const veterinario = await response.json();
        
        const tableBody = document.getElementById('veterinarioTableBody');

        tableBody.innerHTML = veterinario.map(tutor => `
            <tr data-tutor-id="${tutor.cod}">
                <td>${tutor.nome}</td>
                <td><span class="status-${tutor.status ? 'ativo' : 'inativo'}">${tutor.status ? 'Ativo' : 'Inativo'}</span></td>
                <td><button class="btn-editar">Editar</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function () {
                const row = this.closest('tr');
                const tutorId = row.getAttribute('data-tutor-id');
                window.location.href = `editar.html?id=${tutorId}`;
            });
        });
    } catch (error) {
        console.error('Erro ao carregar veterinário:', error);
        alert('Erro ao carregar lista de veterinário. Por favor, recarregue a página.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarVeterinario();

    const searchInput = document.querySelector('.search-box');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const termo = e.target.value.toLowerCase();
            const linhas = document.querySelectorAll('#veterinarioTableBody tr');

            linhas.forEach(linha => {
                const nome = linha.cells[0].textContent.toLowerCase();
                linha.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }
});