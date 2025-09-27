export interface ContactForm {
	name: string
	email: string
	subject: string
	message: string
}

export interface CommentForm {
	name: string
	email: string
	content: string
	parentId?: number
}
