document.addEventListener('DOMContentLoaded', () => {
    const totalHoursInput = document.getElementById('total-hours');
    const addPeriodBtn = document.getElementById('add-period-btn');
    const periodsList = document.getElementById('periods-list');
    const remainingTimeInfo = document.getElementById('remaining-time-info');
    const resultText = document.getElementById('result-text');

    totalHoursInput.addEventListener('input', recalculate);

    addPeriodBtn.addEventListener('click', () => {
        const periodDiv = document.createElement('div');
        periodDiv.classList.add('period-entry');
        periodDiv.innerHTML = `
            <label>Entrada:</label>
            <input type="time" class="start-time">
            <label>Saída:</label>
            <input type="time" class="end-time">
            <span class="period-duration"></span> 
            <button class="remove-period-btn">Remover</button>
        `;
        periodsList.appendChild(periodDiv);

        periodDiv.querySelector('.remove-period-btn').addEventListener('click', () => {
            periodDiv.remove();
            recalculate();
        });

        periodDiv.querySelector('.start-time').addEventListener('input', recalculate);
        periodDiv.querySelector('.end-time').addEventListener('input', recalculate);

        periodDiv.querySelector('.start-time').focus();
    });
    
    addPeriodBtn.click();

    function recalculate() {
        let totalMinutesWorked = 0;
        let lastOpenEntryTime = null;

        const periods = periodsList.querySelectorAll('.period-entry');
        
        periods.forEach(period => {
            const startTime = period.querySelector('.start-time').value;
            const endTime = period.querySelector('.end-time').value;
            const durationSpan = period.querySelector('.period-duration');
            
            if (startTime && endTime) {
                const start = new Date(`1970-01-01T${startTime}`);
                const end = new Date(`1970-01-01T${endTime}`);
                if (end > start) {
                    const diffMs = end - start;
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffMins = Math.floor((diffMs % 3600000) / 60000);
                    durationSpan.textContent = `(${diffHours}h ${diffMins}m)`;
                    totalMinutesWorked += diffMs / 60000;
                } else {
                    durationSpan.textContent = "(inválido)";
                }
            } else {
                durationSpan.textContent = ""; 
            }
            
            if (startTime && !endTime) {
                lastOpenEntryTime = startTime;
            }
        });

        const totalMinutesToWork = parseFloat(totalHoursInput.value) * 60;
        if (isNaN(totalMinutesToWork) || totalMinutesToWork <= 0) {
            resultText.textContent = "Insira um total de horas válido.";
            remainingTimeInfo.textContent = "";
            return;
        }

        const remainingMinutes = totalMinutesToWork - totalMinutesWorked;

        // --- LÓGICA ATUALIZADA PARA O TEMPO RESTANTE / HORA EXTRA ---
        remainingTimeInfo.classList.remove('extra-time'); // Reseta a cor

        if (remainingMinutes > 0) {
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingMins = Math.round(remainingMinutes % 60);
            let remainingText = "Faltam: ";
            if (remainingHours > 0) remainingText += `<strong>${remainingHours}h</strong> `;
            if (remainingMins > 0) remainingText += `<strong>${remainingMins}m</strong>`;
            remainingTimeInfo.innerHTML = remainingText.trim();
        } else if (remainingMinutes === 0) {
            remainingTimeInfo.innerHTML = "<strong>Jornada Completa!</strong>";
        } else { // Se remainingMinutes < 0
            const extraMinutes = Math.abs(remainingMinutes);
            const extraHours = Math.floor(extraMinutes / 60);
            const extraMins = Math.round(extraMinutes % 60);
            let extraText = "Você fez: ";
            if (extraHours > 0) extraText += `<strong>${extraHours}h</strong> `;
            if (extraMins > 0) extraText += `<strong>${extraMins}m</strong>`;
            remainingTimeInfo.innerHTML = `${extraText.trim()} de hora extra.`;
            remainingTimeInfo.classList.add('extra-time'); // Adiciona a cor verde
        }

        // --- LÓGICA PARA O HORÁRIO DE SAÍDA ---
        if (lastOpenEntryTime) {
            if (remainingMinutes > 0) {
                const finalEntryDate = new Date(`1970-01-01T${lastOpenEntryTime}`);
                const departureDate = new Date(finalEntryDate.getTime() + remainingMinutes * 60000);
                const departureHours = String(departureDate.getHours()).padStart(2, '0');
                const departureMinutes = String(departureDate.getMinutes()).padStart(2, '0');
                resultText.innerHTML = `Horário de Saída: <strong>${departureHours}:${departureMinutes}</strong>`;
            } else {
                resultText.innerHTML = `<strong>Você já pode ir para casa!</strong>`;
            }
        } else {
            if (remainingMinutes <= 0) {
                 resultText.innerHTML = `<strong>Trabalho finalizado!</strong>`;
            } else {
                 resultText.textContent = 'Aguardando nova entrada...';
            }
        }
    }
});