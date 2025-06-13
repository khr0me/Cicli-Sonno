        /**
         * Algoritmo avanzato per il calcolo dei cicli del sonno
         * Versione ottimizzata con precisione scientifica
         */
        class SleepCycleCalculator {
            constructor() {
                // Costanti scientificamente validate
                this.SLEEP_CYCLE_DURATION = 90; // minuti per ciclo
                this.FALL_ASLEEP_TIME = 15; // tempo medio per addormentarsi
                this.MIN_CYCLES = 3; // minimo per evitare privazione del sonno
                this.MAX_CYCLES = 8; // massimo per evitare oversleeping
                this.OPTIMAL_CYCLES_MIN = 5; // 7.5 ore (minimo raccomandato)
                this.OPTIMAL_CYCLES_MAX = 6; // 9 ore (massimo raccomandato)
                
                // Fattori di qualità del sonno per diversi cicli
                this.SLEEP_QUALITY_SCORES = {
                    3: 0.6, // 4.5h - sonno insufficiente
                    4: 0.7, // 6h - accettabile per recupero breve
                    5: 0.9, // 7.5h - ottimale per la maggior parte delle persone
                    6: 1.0, // 9h - ideale per recupero completo
                    7: 0.8, // 10.5h - può causare inerzia del sonno
                    8: 0.6  // 12h - oversleeping, può causare sonnolenza
                };
            }

            timeToMinutes(timeString) {
                if (!timeString || !timeString.includes(':')) {
                    throw new Error('Formato ora non valido. Usa HH:MM');
                }
                
                var parts = timeString.split(':');
                var hours = parseInt(parts[0], 10);
                var minutes = parseInt(parts[1], 10);
                
                if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                    throw new Error('Ora non valida. Ore: 0-23, Minuti: 0-59');
                }
                
                return hours * 60 + minutes;
            }

            minutesToTime(minutes) {
                var normalizedMinutes = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
                var hours = Math.floor(normalizedMinutes / 60);
                var mins = normalizedMinutes % 60;
                
                return this.padZero(hours) + ':' + this.padZero(mins);
            }

            padZero(num) {
                return num < 10 ? '0' + num : num.toString();
            }

            formatDuration(totalMinutes) {
                var hours = Math.floor(totalMinutes / 60);
                var minutes = totalMinutes % 60;
                
                if (minutes === 0) {
                    return hours + 'h';
                }
                return hours + 'h ' + minutes + 'm';
            }

            calculateSleepQuality(cycles) {
                return this.SLEEP_QUALITY_SCORES[cycles] || 0.5;
            }

            isOptimalWakeTime(cycles) {
                return cycles >= this.OPTIMAL_CYCLES_MIN && cycles <= this.OPTIMAL_CYCLES_MAX;
            }

            getRecommendation(cycles) {
                var recommendations = {
                    3: 'Sonno minimo - Solo per emergenze',
                    4: 'Sonno breve - Adatto per power nap estesi',
                    5: 'Sonno ottimale - Raccomandato per la maggior parte delle persone',
                    6: 'Sonno ideale - Perfetto per recupero completo',
                    7: 'Sonno lungo - Può causare inerzia al risveglio',
                    8: 'Sonno eccessivo - Rischio di sonnolenza diurna'
                };
                
                return recommendations[cycles] || 'Durata non standard';
            }

            calculateSleepEfficiency(cycles) {
                if (cycles === 5 || cycles === 6) return 95;
                if (cycles === 4 || cycles === 7) return 80;
                if (cycles === 3 || cycles === 8) return 65;
                return 50;
            }

            calculateOptimalWakeTimes(bedtime, fallAsleepTime) {
                if (!fallAsleepTime) fallAsleepTime = this.FALL_ASLEEP_TIME;
                
                try {
                    var bedtimeMinutes = this.timeToMinutes(bedtime);
                    var sleepStartMinutes = bedtimeMinutes + fallAsleepTime;
                    
                    var wakeTimesData = [];
                    
                    for (var cycle = this.MIN_CYCLES; cycle <= this.MAX_CYCLES; cycle++) {
                        var totalSleepMinutes = cycle * this.SLEEP_CYCLE_DURATION;
                        var wakeupMinutes = sleepStartMinutes + totalSleepMinutes;
                        
                        var wakeTimeData = {
                            cycle: cycle,
                            wakeTime: this.minutesToTime(wakeupMinutes),
                            sleepDuration: this.formatDuration(totalSleepMinutes),
                            sleepDurationMinutes: totalSleepMinutes,
                            totalMinutesFromBedtime: fallAsleepTime + totalSleepMinutes,
                            qualityScore: this.calculateSleepQuality(cycle),
                            isOptimal: this.isOptimalWakeTime(cycle),
                            isNextDay: wakeupMinutes >= (24 * 60),
                            sleepEfficiency: this.calculateSleepEfficiency(cycle),
                            recommendation: this.getRecommendation(cycle)
                        };
                        
                        wakeTimesData.push(wakeTimeData);
                    }
                    
                    // Ordina per qualità del sonno (migliori prima)
                    wakeTimesData.sort(function(a, b) {
                        return b.qualityScore - a.qualityScore;
                    });
                    
                    return wakeTimesData;
                    
                } catch (error) {
                    throw new Error('Errore nel calcolo: ' + error.message);
                }
            }
        }

        // Inizializzazione
        var sleepCalculator = new SleepCycleCalculator();
        var bedtimeInput = document.getElementById('bedtime');
        var calculateBtn = document.getElementById('calculateBtn');
        var resultsDiv = document.getElementById('results');

        // Imposta l'ora corrente come default
        var now = new Date();
        var currentTime = now.toTimeString().slice(0, 5);
        bedtimeInput.value = currentTime;

        function calculateWakeupTimes(bedtimeInput) {
            if (!bedtimeInput) {
                showEmptyState();
                return;
            }

            try {
                var cycles = sleepCalculator.calculateOptimalWakeTimes(bedtimeInput);
                displayResults(cycles);
            } catch (error) {
                showError('Errore nel calcolo: ' + error.message);
            }
        }

        function displayResults(cycles) {
            var html = '<h2>⏰ Orari ottimali per svegliarsi</h2>';
            
            for (var i = 0; i < cycles.length; i++) {
                var cycle = cycles[i];
                var efficiencyClass = cycle.sleepEfficiency >= 90 ? 'high-efficiency' : 
                                    cycle.sleepEfficiency >= 80 ? 'medium-efficiency' : 'low-efficiency';
                
                html += '<div class="wake-time ' + (cycle.isOptimal ? 'recommended' : '') + '">';
                html += '<div class="wake-time-header">';
                html += '<div class="time">' + cycle.wakeTime + '</div>';
                if (cycle.isOptimal) {
                    html += '<div class="recommended-badge">Consigliato</div>';
                }
                html += '</div>';
                html += '<div class="cycle-info">' + cycle.cycle + ' cicli di sonno</div>';
                html += '<div class="sleep-duration">Sonno totale: ' + cycle.sleepDuration + '</div>';
                html += '<div class="sleep-efficiency">Efficienza: ' + cycle.sleepEfficiency + '%</div>';
                html += '<div class="recommendation">' + cycle.recommendation + '</div>';
                html += '</div>';
            }
            
            resultsDiv.innerHTML = html;
        }

        function showEmptyState() {
            resultsDiv.innerHTML = '<div class="empty-state">' +
                '<svg viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' +
                '</svg>' +
                '<p>Seleziona l\'ora e premi il pulsante per calcolare i tuoi orari ottimali di risveglio</p>' +
                '</div>';
        }

        function showError(message) {
            resultsDiv.innerHTML = '<div class="empty-state error">' +
                '<p>⚠️ ' + message + '</p>' +
                '</div>';
        }

        function updateButtonState() {
            var hasTime = bedtimeInput.value.trim() !== '';
            calculateBtn.disabled = !hasTime;
        }

        // Event listeners
        calculateBtn.addEventListener('click', function() {
            var bedtime = bedtimeInput.value;
            if (bedtime) {
                calculateWakeupTimes(bedtime);
            }
        });

        bedtimeInput.addEventListener('input', updateButtonState);
        bedtimeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBtn.click();
            }
        });

        // Inizializzazione
        updateButtonState();
        showEmptyState();