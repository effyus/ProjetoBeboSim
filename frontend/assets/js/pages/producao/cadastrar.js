document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    let veterinarios = [];
    let animais = [];
    let selectedVeterinario = null;
    let selectedAnimal = null;
    
    // Carregar veterinários
    async function carregarVeterinarios() {
        try {
            const response = await fetch('/api/veterinario?status=true');
            veterinarios = await response.json();
            
            const veterinarioSelect = document.querySelector('.custom-select-wrapper:first-child .options-container');
            veterinarioSelect.innerHTML = '';
            
            veterinarios.forEach(vet => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = vet.nome;
                option.dataset.id = vet.cod;
                option.addEventListener('click', () => {
                    selectedVeterinario = vet.cod;
                });
                veterinarioSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar veterinários:', error);
        }
    }
    
    // Carregar animais
    async function carregarAnimais() {
        try {
            const response = await fetch('/api/animais?status=true');
            animais = await response.json();
            
            const animalSelect = document.querySelector('.custom-select-wrapper:last-child .options-container');
            animalSelect.innerHTML = '';
            
            animais.forEach(animal => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = animal.nome;
                option.dataset.id = animal.cod;
                option.addEventListener('click', () => {
                    selectedAnimal = animal.cod;
                });
                animalSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar animais:', error);
        }
    }
    
    // Carregar dados iniciais
    carregarVeterinarios();
    carregarAnimais();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validações
        if (!selectedVeterinario) {
            alert('Por favor, selecione um veterinário');
            return;
        }
        
        if (!selectedAnimal) {
            alert('Por favor, selecione um animal');
            return;
        }
        
        const data = document.getElementById('data').value;
        if (!data) {
            alert('Por favor, selecione uma data');
            return;
        }
        
        // Coletando os dados do formulário
        const atendimentoData = {
            cod_animal: selectedAnimal,
            cod_veterinario: selectedVeterinario,
            data: data
        };

        try {
            const response = await fetch('/api/atendimentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atendimentoData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Atendimento cadastrado com sucesso!');
                window.location.href = '/assets/pages/atendimento/buscar.html';
            } else {
                alert('Erro ao cadastrar atendimento: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar atendimento. Por favor, tente novamente.');
        }
    });

}); 

document.addEventListener("DOMContentLoaded", () => {
    const selects = document.querySelectorAll(".custom-select");

    selects.forEach(select => {
      const selected = select.querySelector(".selected");
      const optionsContainer = select.querySelector(".options-container");
      const options = select.querySelectorAll(".option");

      selected.addEventListener("click", () => {
        // Fecha os outros
        selects.forEach(s => {
          if (s !== select) s.classList.remove("open");
        });
        // Toggle este
        select.classList.toggle("open");
      });

      options.forEach(option => {
        option.addEventListener("click", () => {
          selected.textContent = option.textContent;
          select.classList.remove("open");
        });
      });
    });

    // Fecha todos ao clicar fora
    document.addEventListener("click", (e) => {
      selects.forEach(select => {
        if (!select.contains(e.target)) {
          select.classList.remove("open");
        }
      });
    });
  });