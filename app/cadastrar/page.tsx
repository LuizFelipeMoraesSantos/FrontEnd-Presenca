const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!nome || !biometricToken) return; // Evita enviar campos vazios

  setIsSubmitting(true)

  try {
    // Passando 'uid' em vez de 'tagRfid'
    await cadastrarEstudante({ 
      nome, 
      uid: biometricToken 
    })
    
    toast({
      title: "Sucesso!",
      description: "Estudante cadastrado com sucesso.",
    })
    
    setNome("")
    setBiometricToken("") // Limpa o token após cadastrar
    
  } catch (error) {
    console.error(error)
    toast({
      variant: "destructive",
      title: "Erro ao cadastrar",
      description: "Verifique a ligação com o servidor.",
    })
  } finally {
    setIsSubmitting(false)
  }
}