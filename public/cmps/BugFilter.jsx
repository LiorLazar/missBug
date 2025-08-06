const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy, labels: labelsList, sortFields }) {

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

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, labels, sortBy } = filterByToEdit

    const sortOptions = [
        { value: 'title', label: 'Title (A-Z)' },
        { value: '-title', label: 'Title (Z-A)' },
        { value: 'severity', label: 'Severity (Low-High)' },
        { value: '-severity', label: 'Severity (High-Low)' },
        { value: 'createdAt', label: 'Date (Oldest)' },
        { value: '-createdAt', label: 'Date (Newest)' }
    ]

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
                    value={sortBy || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Sort Option</option>
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </form>
        </section>
    )
}