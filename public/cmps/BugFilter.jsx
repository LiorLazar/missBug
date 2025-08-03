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

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

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
                {/* <input value={labelsList} onChange={handleChange} type="text" placeholder="By Label" id="labels" name="labels" /> */}
            </form>
        </section>
    )
}