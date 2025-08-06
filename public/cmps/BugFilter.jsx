const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy, labels: labelsList }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            case 'select-multiple':
                value = Array.from(target.selectedOptions, option => option.value)
                break

            default:
                break
        }

        // Special handling for sortBy - parse the JSON string and create sortBy object
        if (field === 'sortBy' && value) {
            try {
                const sortObject = JSON.parse(value)
                setFilterByToEdit(prevFilter => ({
                    ...prevFilter,
                    sortBy: {
                        sortField: sortObject.sortField,
                        sortDir: sortObject.sortDir
                    }
                }))
            } catch (error) {
                // If parsing fails, just clear the sort
                setFilterByToEdit(prevFilter => ({
                    ...prevFilter,
                    sortBy: null
                }))
            }
        } else if (field === 'sortBy' && !value) {
            // Clear sorting when empty option is selected
            setFilterByToEdit(prevFilter => ({
                ...prevFilter,
                sortBy: null
            }))
        } else {
            setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
        }
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const sortOptions = [
        { sortField: 'title', sortDir: 1, label: 'Title (A-Z)' },
        { sortField: 'title', sortDir: -1, label: 'Title (Z-A)' },
        { sortField: 'severity', sortDir: 1, label: 'Severity (Low-High)' },
        { sortField: 'severity', sortDir: -1, label: 'Severity (High-Low)' },
        { sortField: 'createdAt', sortDir: 1, label: 'Date (Oldest)' },
        { sortField: 'createdAt', sortDir: -1, label: 'Date (Newest)' }
    ]

    const { txt, minSeverity, labels } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <label htmlFor="labels">Label:</label>
                <select
                    className="labels"
                    name="labels"
                    id="labels"
                    value={labels || []}
                    onChange={handleChange}
                    multiple={true}
                >
                    {Array.isArray(labelsList) && labelsList.map(label => (
                        <option key={label} value={label}>{label}</option>
                    ))}
                </select>

                <label htmlFor="sortBy">Sort By:</label>
                <select
                    className="sortBy"
                    name="sortBy"
                    id="sortBy"
                    value={filterByToEdit.sortBy ? JSON.stringify(filterByToEdit.sortBy) : ''}
                    onChange={handleChange}
                >
                    <option value="">Select Sort Option</option>
                    {sortOptions.map((option, index) => (
                        <option key={index} value={JSON.stringify({ sortField: option.sortField, sortDir: option.sortDir })}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </form>
        </section>
    )
}