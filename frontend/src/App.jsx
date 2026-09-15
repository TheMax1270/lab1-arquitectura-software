import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const CUSTOMERS_URL = 'http://localhost:8080/api/customers'
const TRANSACTIONS_URL = 'http://localhost:8080/api/transactions'
const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  accountNumber: '',
  balance: '',
}
const INITIAL_TRANSFER_FORM = {
  senderAccountNumber: '',
  receiverAccountNumber: '',
  amount: '',
}
const INITIAL_EDIT_FORM = {
  id: '',
  firstName: '',
  lastName: '',
  accountNumber: '',
  balance: '',
}

function App() {
  const [activeView, setActiveView] = useState('list')
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formMessage, setFormMessage] = useState('')
  const [formStatus, setFormStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transferData, setTransferData] = useState(INITIAL_TRANSFER_FORM)
  const [transferMessage, setTransferMessage] = useState('')
  const [transferStatus, setTransferStatus] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [historyAccount, setHistoryAccount] = useState('')
  const [queriedAccount, setQueriedAccount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [hasSearchedHistory, setHasSearchedHistory] = useState(false)
  const [editData, setEditData] = useState(INITIAL_EDIT_FORM)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [customerActionMessage, setCustomerActionMessage] = useState('')
  const [customerActionStatus, setCustomerActionStatus] = useState('')

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await axios.get(CUSTOMERS_URL)
      setCustomers(response.data)
    } catch {
      setError(
        'No fue posible consultar los clientes. Verifica que el backend este en ejecucion.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleViewChange = (view) => {
    setActiveView(view)
    setFormMessage('')
    setFormStatus('')
    setTransferMessage('')
    setTransferStatus('')
    setHistoryError('')
    setCustomerActionMessage('')
    setCustomerActionStatus('')
    setIsEditOpen(false)

    if (view === 'list' || view === 'history') {
      loadCustomers()
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const firstName = formData.firstName.trim()
    const lastName = formData.lastName.trim()
    const accountNumber = formData.accountNumber.trim()
    const balance = Number(formData.balance)

    if (!firstName || !lastName || !accountNumber || formData.balance === '') {
      return 'Todos los campos son obligatorios.'
    }

    if (Number.isNaN(balance) || balance < 0) {
      return 'El saldo inicial debe ser numerico y mayor o igual a 0.'
    }

    return ''
  }

  const validateCustomerData = (customerData) => {
    const firstName = customerData.firstName.trim()
    const lastName = customerData.lastName.trim()
    const accountNumber = customerData.accountNumber.trim()

    if (!firstName || !lastName || !accountNumber) {
      return 'Todos los campos son obligatorios.'
    }

    return ''
  }

  const handleTransferInputChange = (event) => {
    const { name, value } = event.target
    setTransferData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const validateTransferForm = () => {
    const senderAccountNumber = transferData.senderAccountNumber.trim()
    const receiverAccountNumber = transferData.receiverAccountNumber.trim()
    const amount = Number(transferData.amount)

    if (!senderAccountNumber || !receiverAccountNumber || transferData.amount === '') {
      return 'Todos los campos son obligatorios.'
    }

    if (Number.isNaN(amount) || amount <= 0) {
      return 'El monto debe ser numerico y mayor que 0.'
    }

    if (senderAccountNumber === receiverAccountNumber) {
      return 'La cuenta origen debe ser distinta de la cuenta destino.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFormStatus('error')
      setFormMessage(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setFormStatus('')
      setFormMessage('')

      await axios.post(CUSTOMERS_URL, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        accountNumber: formData.accountNumber.trim(),
        balance: Number(formData.balance),
      })

      setFormData(INITIAL_FORM)
      setFormStatus('success')
      setFormMessage('Cliente creado correctamente.')
    } catch {
      setFormStatus('error')
      setFormMessage(
        'No fue posible crear el cliente. Verifica los datos o el estado del backend.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransferSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateTransferForm()
    if (validationError) {
      setTransferStatus('error')
      setTransferMessage(validationError)
      return
    }

    try {
      setIsTransferring(true)
      setTransferStatus('')
      setTransferMessage('')

      await axios.post(TRANSACTIONS_URL, {
        senderAccountNumber: transferData.senderAccountNumber.trim(),
        receiverAccountNumber: transferData.receiverAccountNumber.trim(),
        amount: Number(transferData.amount),
      })

      setTransferData(INITIAL_TRANSFER_FORM)
      setTransferStatus('success')
      setTransferMessage('Transferencia realizada correctamente.')
    } catch (requestError) {
      const backendMessage = requestError.response?.data
      setTransferStatus('error')
      setTransferMessage(
        typeof backendMessage === 'string' && backendMessage.trim()
          ? backendMessage
          : 'No fue posible realizar la transferencia. Verifica los datos o el estado del backend.',
      )
    } finally {
      setIsTransferring(false)
    }
  }

  const handleEditClick = (customer) => {
    setEditData({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      accountNumber: customer.accountNumber,
      balance: String(customer.balance),
    })
    setCustomerActionMessage('')
    setCustomerActionStatus('')
    setIsEditOpen(true)
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    setEditData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleEditCancel = () => {
    setIsEditOpen(false)
    setEditData(INITIAL_EDIT_FORM)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateCustomerData(editData)
    if (validationError) {
      setCustomerActionStatus('error')
      setCustomerActionMessage(validationError)
      return
    }

    try {
      setIsUpdating(true)
      setCustomerActionMessage('')
      setCustomerActionStatus('')

      await axios.put(`${CUSTOMERS_URL}/${editData.id}`, {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        accountNumber: editData.accountNumber.trim(),
      })

      setIsEditOpen(false)
      setEditData(INITIAL_EDIT_FORM)
      setCustomerActionStatus('success')
      setCustomerActionMessage('Cliente actualizado correctamente.')
      await loadCustomers()
    } catch (requestError) {
      const backendMessage = requestError.response?.data
      setCustomerActionStatus('error')
      setCustomerActionMessage(
        typeof backendMessage === 'string' && backendMessage.trim()
          ? backendMessage
          : 'No fue posible actualizar el cliente. Verifica los datos o el estado del backend.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar el cliente ${customer.firstName} ${customer.lastName}?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setCustomerActionMessage('')
      setCustomerActionStatus('')

      await axios.delete(`${CUSTOMERS_URL}/${customer.id}`)

      setCustomerActionStatus('success')
      setCustomerActionMessage('Cliente eliminado correctamente.')
      await loadCustomers()
    } catch (requestError) {
      const backendMessage = requestError.response?.data
      setCustomerActionStatus('error')
      setCustomerActionMessage(
        typeof backendMessage === 'string' && backendMessage.trim()
          ? backendMessage
          : 'No fue posible eliminar el cliente. Verifica el estado del backend.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleHistorySubmit = async (event) => {
    event.preventDefault()

    const accountNumber = historyAccount.trim()
    if (!accountNumber) {
      setHistoryError('Debes ingresar o seleccionar un numero de cuenta.')
      setTransactions([])
      setHasSearchedHistory(false)
      return
    }

    try {
      setIsHistoryLoading(true)
      setHistoryError('')
      setHasSearchedHistory(true)
      const response = await axios.get(
        `${TRANSACTIONS_URL}/${encodeURIComponent(accountNumber)}`,
      )
      setTransactions(response.data)
      setQueriedAccount(accountNumber)
    } catch {
      setTransactions([])
      setHistoryError(
        'No fue posible consultar el historial. Verifica el numero de cuenta o el estado del backend.',
      )
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const pageTitle = {
    list: 'Consulta de clientes',
    create: 'Crear cliente',
    transfer: 'Realizar transferencia',
    history: 'Historial de transacciones',
  }[activeView]

  const pageSummary = {
    list: 'Listado general de clientes registrados en el backend Spring Boot.',
    create: 'Registro de nuevos clientes para el sistema bancario.',
    transfer: 'Envio de dinero entre cuentas registradas en el sistema.',
    history: 'Consulta de movimientos asociados a una cuenta bancaria.',
  }[activeView]

  const formatBalance = (balance) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(balance ?? 0)

  const formatDateTime = (timestamp) => {
    if (!timestamp) {
      return 'Sin fecha'
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  }

  const getTransactionType = (transaction) =>
    transaction.senderAccountNumber === queriedAccount ? 'Salida' : 'Entrada'

  return (
    <main className="page">
      <section className="header">
        <p className="eyebrow">{pageTitle}</p>
        <h1>Sistema Bancario</h1>
        <p className="summary">{pageSummary}</p>
      </section>

      <nav className="tabs" aria-label="Navegacion principal">
        <button
          type="button"
          className={activeView === 'list' ? 'tab active' : 'tab'}
          onClick={() => handleViewChange('list')}
        >
          Consulta de clientes
        </button>
        <button
          type="button"
          className={activeView === 'create' ? 'tab active' : 'tab'}
          onClick={() => handleViewChange('create')}
        >
          Crear cliente
        </button>
        <button
          type="button"
          className={activeView === 'transfer' ? 'tab active' : 'tab'}
          onClick={() => handleViewChange('transfer')}
        >
          Realizar transferencia
        </button>
        <button
          type="button"
          className={activeView === 'history' ? 'tab active' : 'tab'}
          onClick={() => handleViewChange('history')}
        >
          Historial de transacciones
        </button>
      </nav>

      {activeView === 'list' && (
        <section className="content" aria-live="polite">
          {!isEditOpen && customerActionMessage && (
            <p
              className={
                customerActionStatus === 'success'
                  ? 'status status-success'
                  : 'status status-error'
              }
            >
              {customerActionMessage}
            </p>
          )}

          {isLoading && <p className="status">Cargando clientes...</p>}

          {!isLoading && error && <p className="status status-error">{error}</p>}

          {!isLoading && !error && customers.length === 0 && (
            <p className="status">No hay clientes registrados</p>
          )}

          {!isLoading && !error && customers.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Numero de cuenta</th>
                    <th>Saldo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.firstName}</td>
                      <td>{customer.lastName}</td>
                      <td>{customer.accountNumber}</td>
                      <td className="balance">{formatBalance(customer.balance)}</td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="action-button secondary"
                            onClick={() => handleEditClick(customer)}
                            disabled={isDeleting}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="action-button danger"
                            onClick={() => handleDeleteCustomer(customer)}
                            disabled={isDeleting}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isEditOpen && (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <p className="modal-eyebrow">Cliente #{editData.id}</p>
                    <h2>Editar cliente</h2>
                  </div>
                  <button
                    type="button"
                    className="close-button"
                    onClick={handleEditCancel}
                    disabled={isUpdating}
                    aria-label="Cerrar formulario de edicion"
                  >
                    ×
                  </button>
                </div>

                <form className="customer-form" onSubmit={handleEditSubmit}>
                  <label>
                    Nombre
                    <input
                      type="text"
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleEditInputChange}
                    />
                  </label>

                  <label>
                    Apellido
                    <input
                      type="text"
                      name="lastName"
                      value={editData.lastName}
                      onChange={handleEditInputChange}
                    />
                  </label>

                  <label>
                    Numero de cuenta
                    <input
                      type="text"
                      name="accountNumber"
                      value={editData.accountNumber}
                      onChange={handleEditInputChange}
                    />
                  </label>

                  <label>
                    Saldo actual
                    <input
                      type="number"
                      name="balance"
                      value={editData.balance}
                      readOnly
                      className="readonly-input"
                    />
                  </label>

                  {customerActionStatus === 'error' && customerActionMessage && (
                    <p className="form-message error">{customerActionMessage}</p>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={handleEditCancel}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {activeView === 'create' && (
        <section className="content form-content" aria-live="polite">
          <form className="customer-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Ej. Ana"
              />
            </label>

            <label>
              Apellido
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Ej. Gomez"
              />
            </label>

            <label>
              Numero de cuenta
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Ej. 1002"
              />
            </label>

            <label>
              Saldo inicial
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            {formMessage && (
              <p
                className={
                  formStatus === 'success'
                    ? 'form-message success'
                    : 'form-message error'
                }
              >
                {formMessage}
              </p>
            )}

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear cliente'}
            </button>
          </form>
        </section>
      )}

      {activeView === 'transfer' && (
        <section className="content form-content" aria-live="polite">
          <form className="customer-form" onSubmit={handleTransferSubmit}>
            <label>
              Cuenta origen
              <input
                type="text"
                name="senderAccountNumber"
                value={transferData.senderAccountNumber}
                onChange={handleTransferInputChange}
                placeholder="Ej. 1001"
              />
            </label>

            <label>
              Cuenta destino
              <input
                type="text"
                name="receiverAccountNumber"
                value={transferData.receiverAccountNumber}
                onChange={handleTransferInputChange}
                placeholder="Ej. 1002"
              />
            </label>

            <label>
              Monto
              <input
                type="number"
                name="amount"
                value={transferData.amount}
                onChange={handleTransferInputChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            {transferMessage && (
              <p
                className={
                  transferStatus === 'success'
                    ? 'form-message success'
                    : 'form-message error'
                }
              >
                {transferMessage}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isTransferring}
            >
              {isTransferring ? 'Procesando...' : 'Realizar transferencia'}
            </button>
          </form>
        </section>
      )}

      {activeView === 'history' && (
        <section className="content history-content" aria-live="polite">
          <form className="history-form" onSubmit={handleHistorySubmit}>
            <label>
              Numero de cuenta
              <input
                type="text"
                value={historyAccount}
                onChange={(event) => setHistoryAccount(event.target.value)}
                placeholder="Ej. 1001"
                list="customer-accounts"
              />
              <datalist id="customer-accounts">
                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.accountNumber}
                    label={`${customer.firstName} ${customer.lastName}`}
                  />
                ))}
              </datalist>
            </label>

            <button
              type="submit"
              className="submit-button"
              disabled={isHistoryLoading}
            >
              {isHistoryLoading ? 'Consultando...' : 'Consultar historial'}
            </button>
          </form>

          {historyError && <p className="status status-error">{historyError}</p>}

          {isHistoryLoading && <p className="status">Cargando transacciones...</p>}

          {!isHistoryLoading &&
            !historyError &&
            hasSearchedHistory &&
            transactions.length === 0 && (
              <p className="status">
                No hay transacciones registradas para esta cuenta
              </p>
            )}

          {!isHistoryLoading && !historyError && transactions.length > 0 && (
            <div className="table-wrapper history-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cuenta origen</th>
                    <th>Cuenta destino</th>
                    <th>Monto</th>
                    <th>Fecha y hora</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{transaction.senderAccountNumber}</td>
                      <td>{transaction.receiverAccountNumber}</td>
                      <td className="balance">
                        {formatBalance(transaction.amount)}
                      </td>
                      <td>{formatDateTime(transaction.timestamp)}</td>
                      <td>
                        <span
                          className={
                            getTransactionType(transaction) === 'Salida'
                              ? 'type-badge outgoing'
                              : 'type-badge incoming'
                          }
                        >
                          {getTransactionType(transaction)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
