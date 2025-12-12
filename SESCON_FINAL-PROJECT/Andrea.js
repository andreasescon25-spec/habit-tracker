document.addEventListener('DOMContentLoaded', () => {

    /* -------------------- BASIC SETUP -------------------- */

    // List of habits in order used in HTML
    const habits = ['wake-up', 'drink-water', 'exercise', 'read', 'meditate'];

    // All clickable habit buttons
    const habitBtns = document.querySelectorAll('.habit-btn');

    // All streak text elements ("Streak: x")
    const streaks = document.querySelectorAll('.streak');

    // Canvas + drawing context for graph
    const canvas = document.getElementById('progress-canvas');
    const ctx = canvas.getContext('2d');

    // Dropdown to select day (1–7)
    const daySelect = document.getElementById('day-select');

    // Timer display element
    const timeLeftEl = document.getElementById('time-left');
    
    // Load saved data from localStorage OR create empty object
    let data = JSON.parse(localStorage.getItem('habitData')) || {};

    // Default selected day is 1
    let currentDay = 1;
    

    /* -------------------- INITIALIZE WEEK DATA -------------------- */

    // Ensure all 7 days exist in storage
    for (let day = 1; day <= 7; day++) {
        // If a day does not exist, add all habits with streak value 0
        if (!data[day]) {
            data[day] = {
                'wake-up': 0,
                'drink-water': 0,
                'exercise': 0,
                'read': 0,
                'meditate': 0
            };
        }
    }
    

    /* -------------------- UPDATE ON-SCREEN VALUES -------------------- */

    function updateDisplay() {
        // For each habit, show updated streak and color (green/yellow/red)
        habits.forEach((habit, i) => {
            const streak = data[currentDay][habit];

            // Update text
            streaks[i].textContent = `Streak: ${streak}`;

            // Color logic based on streak size
            streaks[i].style.color =
                streak >= 6 ? '#4caf50' :  // green
                streak >= 3 ? '#ff9800' :  // orange
                '#f44336';                 // red
        });

        // Update graph visualization
        drawGraph();
    }


    /* -------------------- HABIT BUTTON CLICK HANDLING -------------------- */

    habitBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => {

            // Determine which habit was clicked
            const habit = habits[i];

            // Increase streak for this habit on this day
            data[currentDay][habit]++;

            // Make the button appear to cycle visually (1–2 = checkmark, 0 = box)
            let clickCount = data[currentDay][habit] % 3;

            // Update button appearance
            btn.textContent =
                clickCount === 1 ? '✓' :
                clickCount === 2 ? '✓' :
                '☐';

            // Change button color when fully checked
            btn.style.color = clickCount === 2 ? '#4caf50' : '#000';

            // Save updated data
            localStorage.setItem('habitData', JSON.stringify(data));

            // Refresh display
            updateDisplay();
        });
    });


    /* -------------------- DRAWING THE PROGRESS GRAPH -------------------- */

    function drawGraph() {
        // Clear previous drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const margin = 40;

        /* --- Draw Y-axis Label "Streak" (Vertical Text) --- */
        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2); // rotate text 90 degrees
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('Streak', 0, 0);
        ctx.restore();

        /* --- Draw streak number labels 1–10 vertically --- */
        for (let i = 1; i <= 10; i++) {
            const y = height - margin - (i - 1) * ((height - 2 * margin) / 9);
            ctx.fillStyle = '#333';
            ctx.fillText(i, 30, y + 5);
        }

        /* --- Draw X-axis Label "Habits" --- */
        ctx.fillStyle = '#333';
        ctx.fillText('Habits', width / 2 - 20, height - 10);

        /* --- Number each habit as 1, 2, 3, 4, 5 --- */
        habits.forEach((habit, i) => {
            const x = margin + i * ((width - 2 * margin) / 4);
            ctx.fillText((i + 1), x, height - 25);
        });

        /* --- Draw streak lines for each habit --- */
        habits.forEach((habit, i) => {
            const streak = data[currentDay][habit];

            // Only draw if streak above zero
            if (streak > 0) {
                const x = margin + i * ((width - 2 * margin) / 4);

                // Prevent y from going above chart limit
                const y = height - margin - (Math.min(streak, 10) - 1) * ((height - 2 * margin) / 9);

                // Draw vertical line from bottom to streak height
                ctx.beginPath();
                ctx.moveTo(x, height - margin);
                ctx.lineTo(x, y);

                // Line color based on streak strength
                ctx.strokeStyle =
                    streak >= 6 ? '#4caf50' :
                    streak >= 3 ? '#ff9800' :
                    '#f44336';

                // Line thickness depends on streak
                ctx.lineWidth = Math.min(streak, 5);

                ctx.stroke();
            }
        });
    }


    /* -------------------- DAY SELECTOR HANDLING -------------------- */

    daySelect.addEventListener('change', (e) => {
        // Change active day
        currentDay = parseInt(e.target.value);

        // Update streaks + graph
        updateDisplay();
    });


    /* -------------------- COUNTDOWN TO MIDNIGHT -------------------- */

    function updateCountdown() {
        const now = new Date();

        // Create new Date() set to next midnight
        const resetTime = new Date(now);
        resetTime.setHours(24, 0, 0, 0);

        // Time difference in milliseconds
        const diff = resetTime - now;

        // Convert ms -> hours/minutes/seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update countdown display (with leading zeros)
        timeLeftEl.textContent =
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}`;

        // When countdown reaches 0 → reset streaks
        if (diff <= 0) {
            // Reset every habit for all days
            Object.keys(data).forEach(day => {
                habits.forEach(habit => data[day][habit] = 0);
            });

            // Save reset values
            localStorage.setItem('habitData', JSON.stringify(data));

            // Update HTML display
            updateDisplay();
        }
    }


    /* -------------------- INITIAL APP STARTUP -------------------- */

    setInterval(updateCountdown, 1000); // Update timer every second

    updateDisplay();   // Show initial streaks + graph
    updateCountdown(); // Show initial countdown value
});
